"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        const detail = registerData.detail
        const message = Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join(", ")
          : typeof detail === "string"
            ? detail
            : "Registration failed. Please try again."
        setError(message)
        return
      }

      // Auto-login after successful registration
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        // Registration succeeded but login failed - redirect to login
        router.replace("/login");
        return;
      }

      localStorage.setItem(
        "access_token",
        loginData.access_token
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
          autoComplete="new-password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Confirm Password
        </label>

        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
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
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-[#5F6B7A]">Already have an account? </span>
        <Link href="/login" className="text-[#0972D3] hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
