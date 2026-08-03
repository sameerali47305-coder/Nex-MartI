import User from "@/models/User";
import { adminMessaging } from "@/lib/firebase-admin";

export async function sendPushToUser(
  userId: string,
  notification: { title: string; body: string },
  data?: Record<string, string>
) {
  const user = await User.findById(userId).select("fcmTokens");
  console.log("PUSH DEBUG: user", userId, "has tokens:", user?.fcmTokens?.length ?? 0);

  if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

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
      console.log("PUSH FAILURE detail:", user.fcmTokens[i], "->", r.error?.message);
    }
  });

  const deadTokens: string[] = response.responses
    .map((r, i) => (!r.success ? user.fcmTokens[i] : null))
    .filter((t): t is string => t !== null);

  if (deadTokens.length > 0) {
    user.fcmTokens = user.fcmTokens.filter((t: string) => !deadTokens.includes(t));
    await user.save();
  }
}

export async function sendPushToAllUsers(notification: { title: string; body: string }) {
  const users = await User.find({ fcmTokens: { $exists: true, $ne: [] } }).select("fcmTokens");
  const allTokens = users.flatMap((u) => u.fcmTokens);
  if (allTokens.length === 0) return;

  for (let i = 0; i < allTokens.length; i += 500) {
    await adminMessaging.sendEachForMulticast({
      tokens: allTokens.slice(i, i + 500),
      notification,
    });
  }
}