import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const form = new URLSearchParams();
    form.append("username", body.email);
    form.append("password", body.password);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
      });
    }

    const cookieStore = await cookies();

    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,

    });
  } catch {
    return NextResponse.json(
      {
        detail: "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}