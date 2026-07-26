"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
}

/**
 * Guest-only gate for /login and /register.
 * Wait until after mount so localStorage is readable — same pattern as ProtectedRoute.
 */
export function GuestRoute({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const loggedIn = auth.isAuthenticated();
    setAllowed(!loggedIn);
    setReady(true);
    if (loggedIn) {
      router.replace("/hosted-zones");
    }
  }, [router]);

  if (!ready || !allowed) {
    return null;
  }

  return children;
}
