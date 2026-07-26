"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { loginThrottle } from "@/lib/login-throttle";
import { safeInternalPath } from "@/lib/safe-redirect";

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
  return "Invalid email or password.";
}

export function LoginForm() {
  const [accountId, setAccountId] = useState("route53-clone");
  const [rememberAccount, setRememberAccount] = useState(true);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setCooldown(loginThrottle.getCooldownSeconds());
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      const remaining = loginThrottle.getCooldownSeconds();
      setCooldown(remaining);
      if (remaining <= 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();

    const remaining = loginThrottle.getCooldownSeconds();
    if (remaining > 0) {
      setCooldown(remaining);
      setError(
        `Too many failed attempts. Please wait ${remaining}s before trying again.`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      let data: { detail?: unknown; access_token?: string } = {};
      try {
        data = await response.json();
      } catch {
        setError("Unexpected response from server.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 429) {
          setError(formatDetail(data.detail));
          setLoading(false);
          return;
        }

        const result = loginThrottle.recordFailure();
        if (result.locked) {
          setCooldown(result.cooldownSeconds);
          setError(
            `Too many failed attempts. Please wait ${result.cooldownSeconds}s before trying again.`
          );
        } else {
          setError(formatDetail(data.detail));
        }
        setLoading(false);
        return;
      }

      if (!data.access_token) {
        setError("No access token returned.");
        setLoading(false);
        return;
      }

      loginThrottle.recordSuccess();
      auth.setToken(data.access_token);
      localStorage.setItem("user_email", email);
      if (rememberAccount) {
        localStorage.setItem("aws_account_alias", accountId);
      }

      const nextParam = new URLSearchParams(window.location.search).get("next");
      const next = safeInternalPath(nextParam);
      // Hard navigation so the dashboard layout remounts and reads the token
      window.location.href = next;
    } catch {
      setError("Unable to connect to the server. Is the Next.js app running?");
      setLoading(false);
    }
  }

  const locked = cooldown > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="aws-signin-form"
      method="post"
      action="#"
      noValidate
    >
      <div className="aws-signin-field">
        <label htmlFor="account-id">
          Account ID (12 digits) or account alias{" "}
          <a href="#help" className="aws-signin-inline-link" onClick={(e) => e.preventDefault()}>
            (Don&apos;t have?)
          </a>
        </label>
        <input
          id="account-id"
          name="account"
          type="text"
          autoComplete="organization"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          disabled={locked || loading}
        />
      </div>

      <label className="aws-signin-check">
        <input
          type="checkbox"
          checked={rememberAccount}
          onChange={(e) => setRememberAccount(e.target.checked)}
          disabled={locked || loading}
        />
        <span>Remember this account</span>
      </label>

      <div className="aws-signin-field">
        <label htmlFor="iam-user">IAM user name</label>
        <input
          id="iam-user"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={locked || loading}
        />
      </div>

      <div className="aws-signin-field">
        <div className="aws-signin-label-row">
          <label htmlFor="password">Password</label>
          <a href="#help" className="aws-signin-inline-link" onClick={(e) => e.preventDefault()}>
            Having trouble?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={locked || loading}
        />
      </div>

      <label className="aws-signin-check">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(e) => setShowPassword(e.target.checked)}
          disabled={locked || loading}
        />
        <span>Show password</span>
      </label>

      {error && (
        <div className="aws-signin-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="aws-signin-primary"
        disabled={loading || locked}
      >
        {locked
          ? `Try again in ${cooldown}s`
          : loading
            ? "Signing in…"
            : "Sign in"}
      </button>

      <button
        type="button"
        className="aws-signin-secondary"
        disabled={locked || loading}
        onClick={() => {
          setEmail("demo@example.com");
          setPassword("password123");
        }}
      >
        Sign in using root user email
      </button>

      <p className="aws-signin-demo">
        Demo: <code>demo@example.com</code> / <code>password123</code>
      </p>

      <p className="aws-signin-create">
        <Link href="/register">Create a new AWS account</Link>
      </p>
    </form>
  );
}
