import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/jwt";
import { sendOtpEmail } from "@/lib/sendEmail";
import type {
  RegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
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
