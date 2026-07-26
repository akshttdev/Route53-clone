"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Globe,
  Home,
  Shield,
  Settings,
} from "lucide-react";

const links = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Hosted Zones",
    href: "/hosted-zones",
    icon: Globe,
  },
  {
    title: "Health Checks",
    href: "/health-checks",
    icon: Shield,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="border-b p-6">
        <h2 className="text-xl font-bold">
          Route53
        </h2>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;

            const active =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-none px-4 py-3 transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5" />

                {link.title}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}