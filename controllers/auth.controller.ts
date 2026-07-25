import { NextRequest, NextResponse } from "next/server";

import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validations/auth";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  AuthError,
} from "@/services/auth.service";

export async function registerController(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const user = await registerUser(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Account created. Please check your email for a verification code.",
        data: { user },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error, "Registration failed. Please try again.");
  }
}

export async function verifyOtpController(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await verifyOtp(parsed.data);

    return NextResponse.json(
      { success: true, message: "Email verified successfully.", data: result },
      { status: 200 }
    );
  } catch (error) {
    return handleAuthError(error, "Email verification failed.");
  }
}

export async function resendOtpController(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = resendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const result = await resendOtp(parsed.data);

    return NextResponse.json(
      { success: true, message: "A new code has been sent to your email.", data: result },
      { status: 200 }
    );
  } catch (error) {
    return handleAuthError(error, "Failed to resend code.");
  }
}

export async function loginController(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, user } = await loginUser(parsed.data);

    return NextResponse.json(
      { success: true, message: "Login successful.", data: { token, user } },
      { status: 200 }
    );
  } catch (error) {
    return handleAuthError(error, "Login failed. Please try again.");
  }
}

export async function forgotPasswordController(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await forgotPassword(parsed.data);

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a reset code has been sent.",
    });
  } catch (error) {
    return handleAuthError(error, "Failed to send reset code.");
  }
}

export async function resetPasswordController(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await resetPassword(parsed.data);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    return handleAuthError(error, "Failed to reset password.");
  }
}

function handleAuthError(error: unknown, fallbackMessage: string) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }

  console.error(error);
  return NextResponse.json(
    { success: false, message: fallbackMessage },
    { status: 500 }
  );
}