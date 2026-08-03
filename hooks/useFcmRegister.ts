"use client";

import { useEffect } from "react";
import { requestFcmToken } from "@/lib/firebase-client";

export function useFcmRegister(isLoggedIn: boolean, authToken: string | null) {
  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    requestFcmToken()
      .then((fcmToken) => {
        if (!fcmToken) return;
        return fetch("/api/notifications/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token: fcmToken }),
        });
      })
      .catch(() => {});
  }, [isLoggedIn, authToken]);
}