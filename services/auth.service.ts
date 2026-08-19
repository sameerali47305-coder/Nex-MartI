import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { sendOtpEmail, sendPasswordResetOtp } from "@/lib/sendEmail";
import { verifyGoogleToken } from "@/lib/googleAuth";
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/validations/auth";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp() {
  // 6-digit numeric code, zero-padded (e.g. "042913")
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function registerUser({ name, email, password }: RegisterInput) {
  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const otpCode = generateOtp();
  const otpExpiry = new Date(Date.now() + OTP_TTL_MS);

  const user = await User.create({
    name,
    email,
    password, // hashed automatically by the User model's pre-save hook
    otpCode,
    otpExpiry,
  });

  try {
    await sendOtpEmail(user.email, user.name, otpCode);
  } catch (emailError) {
    console.error("Failed to send verification email:", emailError);
  }

  return { id: user._id.toString(), name: user.name, email: user.email };
}

export async function verifyOtp({ email, otp }: VerifyOtpInput) {
  await connectDB();

  const user = await User.findOne({ email }).select("+otpCode +otpExpiry");

  if (!user) {
    throw new AuthError("No account found with this email", 404);
  }

  if (user.isVerified) {
    throw new AuthError("This account is already verified", 400);
  }

  if (!user.otpCode || !user.otpExpiry || user.otpExpiry < new Date()) {
    throw new AuthError("This code has expired. Please request a new one.", 400);
  }

  if (user.otpCode !== otp) {
    throw new AuthError("Incorrect code. Please try again.", 400);
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return { email: user.email };
}

export async function resendOtp({ email }: ResendOtpInput) {
  await connectDB();

  const user = await User.findOne({ email });

  if (!user) {
    throw new AuthError("No account found with this email", 404);
  }

  if (user.isVerified) {
    throw new AuthError("This account is already verified", 400);
  }

  const otpCode = generateOtp();
  user.otpCode = otpCode;
  user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
  await user.save();

  await sendOtpEmail(user.email, user.name, otpCode);

  return { email: user.email };
}

export async function loginUser({ email, password }: LoginInput) {
  await connectDB();

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthError("Invalid email or password", 401);
  }

  if (!user.isVerified) {
    throw new AuthError(
      "Please verify your email before logging in. Check your inbox for the verification code.",
      403
    );
  }

  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function forgotPassword({ email }: ForgotPasswordInput) {
  await connectDB();

  const user = await User.findOne({ email });

  // Always return success even if the email doesn't exist — this prevents
  // leaking which emails are registered (a common account-enumeration risk).
  if (!user) {
    return { email };
  }

  const otp = generateOtp();
  user.resetOtpCode = otp;
  user.resetOtpExpiry = new Date(Date.now() + OTP_TTL_MS);
  await user.save();

  try {
    await sendPasswordResetOtp(user.email, user.name, otp);
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
  }

  return { email };
}

export async function resetPassword({ email, otp, newPassword }: ResetPasswordInput) {
  await connectDB();

  const user = await User.findOne({ email }).select("+resetOtpCode +resetOtpExpiry");

  if (!user) {
    throw new AuthError("No account found with this email", 404);
  }

  if (!user.resetOtpCode || !user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
    throw new AuthError("This code has expired. Please request a new one.", 400);
  }

  if (user.resetOtpCode !== otp) {
    throw new AuthError("Incorrect code. Please try again.", 400);
  }

  user.password = newPassword; // re-hashed automatically by the pre-save hook
  user.resetOtpCode = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  return { email: user.email };
}

export async function loginOrRegisterWithGoogle(idToken: string, allowCreate: boolean = true) {
  await connectDB();
  const profile = await verifyGoogleToken(idToken);

  let user = await User.findOne({ googleId: profile.googleId });

  if (!user) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.googleId;
      if (!user.avatar) user.avatar = profile.avatar;
      user.isVerified = true;
      await user.save();
    } else {
      if (!allowCreate) {
        throw new AuthError("No account found with this email. Please sign up first.", 404);
      }
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        avatar: profile.avatar,
        isVerified: true,
      });
    }
  }

  const token = generateToken({ userId: user._id.toString(), email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      googleLinked: true,
    },
  };
}

export async function linkGoogleAccount(userId: string, idToken: string) {
  await connectDB();
  const profile = await verifyGoogleToken(idToken);

  const takenBy = await User.findOne({ googleId: profile.googleId });
  if (takenBy && takenBy._id.toString() !== userId) {
    throw new AuthError("This Google account is already linked to another user", 409);
  }

  const currentUser = await User.findById(userId);
  if (!currentUser) throw new AuthError("User not found", 404);
  if (profile.email !== currentUser.email) {
    throw new AuthError("This Google account's email doesn't match your account email", 400);
  }

  currentUser.googleId = profile.googleId;
  if (!currentUser.avatar) currentUser.avatar = profile.avatar;
  await currentUser.save();

  return { success: true, avatar: currentUser.avatar };
}