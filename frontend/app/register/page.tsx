"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { AwsSignInLogo } from "@/components/auth/aws-logo";
import { GuestRoute } from "@/components/auth/guest-route";

export default function RegisterPage() {
  return (
    <GuestRoute>
    <div className="aws-signin-page">
      <header className="aws-signin-topbar">
        <div className="aws-signin-topbar__links">
          <button type="button">Provide feedback</button>
          <span className="aws-signin-sep" />
          <button type="button">English ▾</button>
        </div>
      </header>

      <main className="aws-signin-main">
        <div className="aws-signin-shell">
          <div className="aws-signin-brand">
            <AwsSignInLogo className="aws-signin-logo" />
          </div>

          <div className="aws-signin-layout aws-signin-layout--single">
            <div className="aws-signin-column">
              <section className="aws-signin-card" aria-labelledby="register-title">
                <h1 id="register-title" className="aws-signin-title">
                  Create AWS account
                </h1>
                <p className="aws-signin-subtitle">Sign up for this Route 53 console clone.</p>
                <RegisterForm />
              </section>

              <footer className="aws-signin-legal">
                <p>
                  © 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
                </p>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
    </GuestRoute>
  );
}
