"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import SplitPanel from "@cloudscape-design/components/split-panel";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { KeyboardShortcutsProvider } from "@/components/layout/keyboard-shortcuts";
import { ClientOnly } from "@/components/common/client-only";
import { AwsConsoleHeader } from "@/components/layout/aws-console-header";
import { ConsoleFooter } from "@/components/layout/console-footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  SplitPanelProvider,
  useSplitPanel,
} from "@/components/layout/split-panel-context";

const NAV_ITEMS = [
  { type: "link" as const, text: "Dashboard", href: "/dashboard" },
  { type: "link" as const, text: "Hosted zones", href: "/hosted-zones" },
  { type: "link" as const, text: "Health checks", href: "/health-checks" },
  { type: "link" as const, text: "Profiles", href: "/profiles" },
  {
    type: "section" as const,
    text: "IP-based routing",
    defaultExpanded: true,
    items: [
      { type: "link" as const, text: "CIDR collections", href: "/cidr-collections" },
    ],
  },
  {
    type: "section" as const,
    text: "Traffic flow",
    defaultExpanded: true,
    items: [
      { type: "link" as const, text: "Traffic policies", href: "/traffic-policies" },
      { type: "link" as const, text: "Policy records", href: "/policy-records" },
    ],
  },
  {
    type: "section" as const,
    text: "Domains",
    defaultExpanded: true,
    items: [
      { type: "link" as const, text: "Registered domains", href: "/registered-domains" },
      { type: "link" as const, text: "Requests", href: "/domain-requests" },
    ],
  },
  {
    type: "section" as const,
    text: "Resolver",
    defaultExpanded: true,
    items: [
      { type: "link" as const, text: "VPCs", href: "/resolver/vpcs" },
      { type: "link" as const, text: "Inbound endpoints", href: "/resolver/inbound" },
      { type: "link" as const, text: "Outbound endpoints", href: "/resolver/outbound" },
      { type: "link" as const, text: "Rules", href: "/resolver/rules" },
    ],
  },
];

function resolveActiveHref(pathname: string): string {
  if (pathname.startsWith("/hosted-zones")) return "/hosted-zones";
  if (pathname.startsWith("/health-checks")) return "/health-checks";
  if (pathname.startsWith("/profiles")) return "/profiles";
  if (pathname.startsWith("/traffic-policies")) return "/traffic-policies";
  if (pathname.startsWith("/policy-records")) return "/policy-records";
  if (pathname.startsWith("/cidr-collections")) return "/cidr-collections";
  if (pathname.startsWith("/registered-domains")) return "/registered-domains";
  if (pathname.startsWith("/domain-requests")) return "/domain-requests";
  if (pathname.startsWith("/resolver")) return pathname;
  if (pathname.startsWith("/dashboard")) return "/dashboard";
  return pathname;
}

function ConsoleAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [splitPanelPreferences, setSplitPanelPreferences] = useState<{
    position: "side" | "bottom";
  }>({ position: "side" });
  const [splitPanelSize, setSplitPanelSize] = useState(340);
  const { state, setSplitPanel } = useSplitPanel();

  const showSplit =
    pathname.startsWith("/hosted-zones") &&
    !pathname.endsWith("/create") &&
    !pathname.includes("/create-record");

  return (
    <AppLayout
      headerSelector="#h"
      footerSelector="#f"
      disableBodyScroll
      navigation={
        <SideNavigation
          header={{ href: "/hosted-zones", text: "Route 53" }}
          activeHref={resolveActiveHref(pathname)}
          items={NAV_ITEMS}
          onFollow={(event) => {
            if (!event.detail.external) {
              event.preventDefault();
              router.push(event.detail.href);
            }
          }}
        />
      }
      navigationOpen={navigationOpen}
      onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
      content={<ClientOnly>{children}</ClientOnly>}
      toolsHide
      contentType="table"
      splitPanelOpen={showSplit ? state.open : false}
      splitPanelSize={splitPanelSize}
      onSplitPanelResize={({ detail }) => setSplitPanelSize(detail.size)}
      splitPanelPreferences={splitPanelPreferences}
      onSplitPanelPreferencesChange={({ detail }) =>
        setSplitPanelPreferences(detail)
      }
      onSplitPanelToggle={({ detail }) =>
        setSplitPanel({ open: detail.open })
      }
      splitPanel={
        showSplit ? (
          <SplitPanel header={state.header || "Details"}>
            {state.content}
          </SplitPanel>
        ) : undefined
      }
    />
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState("demo@example.com");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      const isDark = savedTheme === "dark";
      setDarkMode(isDark);
      applyMode(isDark ? Mode.Dark : Mode.Light);
      if (!savedTheme) localStorage.setItem("theme", "light");

      const email = localStorage.getItem("user_email");
      if (email) setUserEmail(email);
    } catch {
      try {
        applyMode(Mode.Light);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    applyMode(next ? Mode.Dark : Mode.Light);
  };

  const handleSignOut = async () => {
    const { auth } = await import("@/lib/auth");
    await auth.logout();
  };

  return (
    <KeyboardShortcutsProvider>
      <SplitPanelProvider>
        <ProtectedRoute>
          <div className="console-shell">
            <AwsConsoleHeader
              userEmail={userEmail}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onSignOut={handleSignOut}
            />

            <div className="console-shell__body">
              <ConsoleAppLayout>{children}</ConsoleAppLayout>
            </div>
            <ConsoleFooter />
          </div>
        </ProtectedRoute>
      </SplitPanelProvider>
    </KeyboardShortcutsProvider>
  );
}
