import { NextResponse } from "next/server";

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000/api/v1"
  );
}

function extractError(data: unknown): string {
  if (!data || typeof data !== "object") return "Login failed";
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

  return "Invalid email or password.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required." },
        { status: 400 }
      );
    }

    if (email.length > 254 || password.length > 256) {
      return NextResponse.json(
        { detail: "Invalid credentials." },
        { status: 400 }
      );
    }

    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const response = await fetch(`${apiBase()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
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

    const token = (data as { access_token?: string }).access_token;
    if (!token) {
      return NextResponse.json(
        { detail: "Backend did not return an access token." },
        { status: 502 }
      );
    }

    const res = NextResponse.json({
      access_token: token,
      token_type: (data as { token_type?: string }).token_type ?? "bearer",
    });

    res.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to reach the API";
    return NextResponse.json(
      {
        detail: `Login failed: ${message}. Start the backend on :8000 or set NEXT_PUBLIC_API_URL.`,
      },
      { status: 500 }
    );
  }
}
