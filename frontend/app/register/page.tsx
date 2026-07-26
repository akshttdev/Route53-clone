"use client";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
        background: "#EAEDED",
      }}
    >
      <header style={{ background: "#232F3E", padding: "16px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
          <span style={{ color: "#FF9900" }}>amazon</span>
          <span style={{ marginLeft: 6 }}>route 53</span>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#fff",
            border: "1px solid #D5DBDB",
            borderRadius: 8,
            padding: 32,
            boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              color: "#16191F",
            }}
          >
            Create account
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#5F6B7A" }}>
            Sign up to access the Route 53 console
          </p>

          <div style={{ marginTop: 24 }}>
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  );
}
