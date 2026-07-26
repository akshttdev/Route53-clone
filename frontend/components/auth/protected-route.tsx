"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/auth";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({
  children,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  if (!auth.isAuthenticated()) {
    return null;
  }

  return children;
}