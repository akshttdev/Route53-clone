"use client";

import { useState } from "react";
import Link from "next/link";

import { auth } from "@/lib/auth";

function formatDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) =>
        typeof d === "object" && d && "msg" in d
          ? String((d as { msg: unknown }).msg)
          : String(d)
      )
      .join(", ");
  }
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return "Registration failed. Please try again.";
}

function extractError(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Registration failed. Please try again.";
  }
  const obj = data as Record<string, unknown>;
  if (obj.detail !== undefined) return formatDetail(obj.detail);
  if (obj.error !== undefined) return formatDetail(obj.error);
  return "Registration failed. Please try again.";
}

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(extractError(registerData));
        setLoading(false);
        return;
      }

      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        window.location.href = "/login";
        return;
      }

      if (!loginData.access_token) {
        setError("No access token returned after registration.");
        setLoading(false);
        return;
      }

      auth.setToken(loginData.access_token);
      localStorage.setItem("user_email", email);
      window.location.href = "/hosted-zones";
    } catch {
      setError("Unable to connect to the server.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="aws-signin-form" noValidate>
      <div className="aws-signin-field">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="aws-signin-field">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="aws-signin-field">
        <label htmlFor="reg-confirm">Confirm password</label>
        <input
          id="reg-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <label className="aws-signin-check">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          disabled={loading}
        />
        <span>Show password</span>
      </label>

      {error && (
        <div className="aws-signin-error" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="aws-signin-primary" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="aws-signin-create">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </form>
  );
}
