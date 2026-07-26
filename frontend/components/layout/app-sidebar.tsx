"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { sidebarSections } from "./sidebar-config";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r border-[#D5DBDB] bg-white">
      <div className="border-b border-[#D5DBDB] px-6 py-5">
        <h1 className="text-lg font-semibold tracking-tight text-[#16191F]">
          Route 53
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="px-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#5F6B7A]">
              {section.title}
            </p>

            <ul className="space-y-1">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "mx-2 flex items-center gap-3 rounded-none px-4 py-2 text-[14px] font-medium transition-colors",
                        active
                          ? "bg-[#EAF3FC] text-[#0972D3]"
                          : "text-[#16191F] hover:bg-[#F2F3F3]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />

                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}