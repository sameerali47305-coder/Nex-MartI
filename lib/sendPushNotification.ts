import User from "@/models/User";
import { adminMessaging } from "@/lib/firebase-admin";

export async function sendPushToUser(
  userId: string,
  notification: { title: string; body: string },
  data?: Record<string, string>
) {
  const user = await User.findById(userId).select("fcmTokens notificationsEnabled");
 console.log("PUSH DEBUG: user", userId, "has tokens:", user?.fcmTokens?.length ?? 0, "notificationsEnabled:", user?.notificationsEnabled);

  if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

  // Skip if user disabled push notifications
  if (user.notificationsEnabled === false) return;

  const response = await adminMessaging.sendEachForMulticast({
    tokens: user.fcmTokens,
    notification,
    data,
  });

  console.log(
    "PUSH RESULT: success =", response.successCount,
    "failure =", response.failureCount
  );

  response.responses.forEach((r, i) => {
    if (!r.success) {
      console.log("PUSH FAILURE detail:", user.fcmTokens[i], "->", r.error?.code, r.error?.message);
    }
  });

  // Filter out ONLY tokens that FCM confirms are dead/invalid
  const deadTokenCodes = [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
  ];

  const deadTokens: string[] = response.responses
    .map((r, i) => {
      if (!r.success && r.error?.code && deadTokenCodes.includes(r.error.code)) {
        return user.fcmTokens[i];
      }
      return null;
    })
    .filter((t): t is string => t !== null);

  if (deadTokens.length > 0) {
    user.fcmTokens = user.fcmTokens.filter((t: string) => !deadTokens.includes(t));
    await user.save();
  }
}

export async function sendPushToAllUsers(notification: { title: string; body: string }) {
  // Query only users who have tokens AND haven't explicitly disabled notifications
  const users = await User.find({
    fcmTokens: { $exists: true, $ne: [] },
    notificationsEnabled: { $ne: false },
  }).select("fcmTokens");

  const allTokens = users.flatMap((u) => u.fcmTokens);
  if (allTokens.length === 0) return;

  for (let i = 0; i < allTokens.length; i += 500) {
    await adminMessaging.sendEachForMulticast({
      tokens: allTokens.slice(i, i + 500),
      notification,
    });
  }
}