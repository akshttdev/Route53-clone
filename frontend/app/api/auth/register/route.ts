import { NextResponse } from "next/server";

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000/api/v1"
  );
}

function extractError(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Registration failed.";
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj.detail === "string") return obj.detail;
  if (Array.isArray(obj.detail)) {
    return obj.detail
      .map((item) =>
        typeof item === "object" && item && "msg" in item
          ? String((item as { msg: unknown }).msg)
          : String(item)
      )
      .join(", ");
  }

  const err = obj.error;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }

  return "Registration failed.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required." },
        { status: 400 }
      );
    }

    if (email.length > 254 || password.length > 256) {
      return NextResponse.json(
        { detail: "Invalid registration payload." },
        { status: 400 }
      );
    }

    const response = await fetch(`${apiBase()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const text = await response.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        {
          detail: `Backend returned non-JSON (${response.status}). Is the API running at ${apiBase()}?`,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const headers = new Headers();
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) headers.set("Retry-After", retryAfter);

      return NextResponse.json(
        { detail: extractError(data) },
        { status: response.status, headers }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to reach the API";
    return NextResponse.json(
      {
        detail: `Registration failed: ${message}. Start the backend on :8000 or set NEXT_PUBLIC_API_URL.`,
      },
      { status: 500 }
    );
  }
}
