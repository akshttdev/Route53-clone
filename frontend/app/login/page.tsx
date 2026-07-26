"use client";

import { LoginForm } from "@/components/auth/login-form";
import { AwsSignInLogo } from "@/components/auth/aws-logo";
import { GuestRoute } from "@/components/auth/guest-route";

export default function LoginPage() {
  return (
    <GuestRoute>
    <div className="aws-signin-page">
      <header className="aws-signin-topbar">
        <div className="aws-signin-topbar__links">
          <button type="button">Provide feedback</button>
          <span className="aws-signin-sep" />
          <button type="button">Multi-session disabled ▾</button>
          <span className="aws-signin-sep" />
          <button type="button">English ▾</button>
        </div>
      </header>

      <main className="aws-signin-main">
        <div className="aws-signin-shell">
          <div className="aws-signin-brand">
            <AwsSignInLogo className="aws-signin-logo" />
          </div>

          <div className="aws-signin-layout">
            <div className="aws-signin-column">
              <section className="aws-signin-card" aria-labelledby="signin-title">
                <h1 id="signin-title" className="aws-signin-title">
                  IAM user sign in
                  <span
                    className="aws-signin-info"
                    title="Sign in with your Route 53 clone credentials"
                  >
                    i
                  </span>
                </h1>
                <LoginForm />
              </section>

              <footer className="aws-signin-legal">
                <p>
                  © 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
                </p>
                <p>
                  <a href="#terms">Conditions of Use</a>
                  {" · "}
                  <a href="#privacy">Privacy Notice</a>
                </p>
              </footer>
            </div>

            <aside className="aws-signin-promo" aria-label="Featured">
              <div className="aws-signin-promo__inner">
                <h2>Amazon Route 53</h2>
                <p>
                  Highly available and scalable Domain Name System (DNS) web service — manage
                  hosted zones and records from this console clone.
                </p>
                <a className="aws-signin-promo__cta" href="#learn">
                  Learn more »
                </a>
                <div className="aws-signin-promo__art" aria-hidden>
                  <svg viewBox="0 0 120 100" width="120" height="100">
                    <circle cx="60" cy="42" r="28" fill="none" stroke="#fff" strokeWidth="2" />
                    <path
                      d="M40 70c8 12 32 12 40 0"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="38" r="3" fill="#fff" />
                    <circle cx="70" cy="38" r="3" fill="#fff" />
                    <path
                      d="M48 50c6 6 18 6 24 0"
                      fill="none"
                      stroke="#FF9900"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
    </GuestRoute>
  );
}
