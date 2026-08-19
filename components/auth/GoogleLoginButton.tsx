"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { googleAuthRequest } from "@/helpers/authApi";
import { linkGoogleRequest } from "@/helpers/userApi";
import { useAuth } from "@/context/AuthContext";

interface GoogleLoginButtonProps {
  mode?: "auth" | "login" | "link";
  onLinked?: () => void;
  onBeforeLogin?: () => void;
}

export default function GoogleLoginButton({
  mode = "auth",
  onLinked,
  onBeforeLogin,
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const { login } = useAuth();

  async function handleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in was cancelled.");
      return;
    }

    try {
      if (mode === "link") {
        await linkGoogleRequest(credentialResponse.credential);
        toast.success("Google account linked!");
        onLinked?.();
        return;
      }

      const res = await googleAuthRequest(
        credentialResponse.credential,
        mode !== "login"
      );
      if (res.data) {
        onBeforeLogin?.();
        login(res.data.user, res.data.token);
        toast.success("Signed in with Google");
        router.push("/");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in failed")}
        theme="outline"
        shape="pill"
        width="320"
        text={mode === "link" ? "signin_with" : undefined}
      />
    </div>
  );
}