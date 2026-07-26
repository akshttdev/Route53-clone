"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ??
            "Invalid email or password."
        );
        return;
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );
      localStorage.setItem("user_email", email);

      router.replace("/hosted-zones");
      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Email
        </label>

        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Password
        </label>

        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-[#5F6B7A]">New to Route 53? </span>
        <Link href="/register" className="text-[#0972D3] hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}