"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { hostedZoneService } from "@/services/hosted-zone.service";
import { HostedZone } from "@/types/hosted-zone";

interface AwsConsoleHeaderProps {
  userEmail: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
}

const SERVICE_SHORTCUTS = [
  { label: "Route 53 — Hosted zones", href: "/hosted-zones", keywords: ["hosted", "zone", "dns", "route53", "route 53"] },
  { label: "Route 53 — Dashboard", href: "/dashboard", keywords: ["dashboard"] },
  { label: "Route 53 — Health checks", href: "/health-checks", keywords: ["health"] },
  { label: "Route 53 — Traffic policies", href: "/traffic-policies", keywords: ["traffic", "policy"] },
  { label: "Route 53 — Resolver", href: "/resolver", keywords: ["resolver"] },
  { label: "Route 53 — Profiles", href: "/profiles", keywords: ["profile"] },
  { label: "Registered domains", href: "/registered-domains", keywords: ["domain", "register"] },
];

export function AwsConsoleHeader({
  userEmail,
  darkMode,
  onToggleDarkMode,
  onSignOut,
}: AwsConsoleHeaderProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debounced) {
        setZones([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const res = await hostedZoneService.getHostedZones({
          q: debounced,
          page: 1,
          page_size: 8,
        });
        if (!cancelled) setZones(res.items);
      } catch {
        if (!cancelled) setZones([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setAccountOpen(false);
        setServicesOpen(false);
        setRegionOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
        setServicesOpen(false);
        setRegionOpen(false);
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const displayName = userEmail.split("@")[0] || "account";

  const serviceMatches = useMemo(() => {
    const q = debounced.toLowerCase();
    if (!q) return SERVICE_SHORTCUTS.slice(0, 4);
    return SERVICE_SHORTCUTS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.includes(q) || q.includes(k))
    );
  }, [debounced]);

  const go = (href: string) => {
    setSearchOpen(false);
    setSearch("");
    router.push(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;

    if (zones.length === 1) {
      go(`/hosted-zones/${zones[0].id}`);
      return;
    }

    const service = serviceMatches[0];
    if (zones.length === 0 && service) {
      go(service.href);
      return;
    }

    // Filter hosted zones list by query
    go(`/hosted-zones?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="aws-console-header" id="h">
      <div className="aws-console-header__left">
        <button
          type="button"
          className="aws-logo"
          onClick={() => router.push("/hosted-zones")}
          aria-label="AWS"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/aws-logo.png"
            alt="AWS"
            className="aws-logo__img"
            width={36}
            height={22}
          />
        </button>

        <div className="aws-header-dropdown">
          <button
            type="button"
            className="aws-header-btn"
            onClick={() => {
              setServicesOpen((v) => !v);
              setAccountOpen(false);
              setRegionOpen(false);
            }}
          >
            <ServicesIcon />
            <span>Services</span>
          </button>
          {servicesOpen && (
            <div className="aws-header-menu">
              {SERVICE_SHORTCUTS.map((s) => (
                <button
                  key={s.href}
                  type="button"
                  onClick={() => {
                    setServicesOpen(false);
                    router.push(s.href);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="aws-search-wrap" ref={searchWrapRef}>
          <form className="aws-search" onSubmit={handleSearch}>
            <SearchIcon />
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search for services, features, hosted zones..."
              aria-label="Search"
              aria-expanded={searchOpen}
              autoComplete="off"
            />
            <kbd className="aws-search__hint">[Alt+S]</kbd>
          </form>

          {searchOpen && (
            <div className="aws-search-results" role="listbox">
              {searching && (
                <div className="aws-search-results__meta">Searching…</div>
              )}

              {zones.length > 0 && (
                <>
                  <div className="aws-search-results__group">Hosted zones</div>
                  {zones.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      className="aws-search-results__item"
                      onClick={() => go(`/hosted-zones/${z.id}`)}
                    >
                      <span className="aws-search-results__title">{z.name}</span>
                      <span className="aws-search-results__sub">
                        {z.type} · {z.recordCount} records · /hostedzone/{z.id}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {serviceMatches.length > 0 && (
                <>
                  <div className="aws-search-results__group">Services</div>
                  {serviceMatches.map((s) => (
                    <button
                      key={s.href}
                      type="button"
                      className="aws-search-results__item"
                      onClick={() => go(s.href)}
                    >
                      <span className="aws-search-results__title">{s.label}</span>
                    </button>
                  ))}
                </>
              )}

              {debounced && !searching && zones.length === 0 && serviceMatches.length === 0 && (
                <div className="aws-search-results__meta">
                  No matches. Press Enter to search hosted zones.
                </div>
              )}

              {!debounced && (
                <div className="aws-search-results__meta">
                  Try “hosted zones”, a domain name, or a service.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="aws-console-header__right" ref={accountRef}>
        <IconButton
          label="CloudShell"
          onClick={() =>
            toast.message("CloudShell", {
              description: "Mocked in this Route 53 clone — no shell session.",
            })
          }
        >
          <CloudShellIcon />
        </IconButton>
        <IconButton
          label="Notifications"
          onClick={() =>
            toast.message("Notifications", {
              description: "No new notifications.",
            })
          }
        >
          <BellIcon />
        </IconButton>
        <IconButton
          label="Help"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-shortcuts-modal"))
          }
        >
          <HelpIcon />
        </IconButton>
        <IconButton label="Settings" onClick={onToggleDarkMode}>
          <SettingsIcon />
        </IconButton>

        <div className="aws-header-dropdown">
          <button
            type="button"
            className="aws-header-btn aws-header-btn--text"
            onClick={() => {
              setRegionOpen((v) => !v);
              setAccountOpen(false);
              setServicesOpen(false);
            }}
          >
            Global
            <ChevronIcon />
          </button>
          {regionOpen && (
            <div className="aws-header-menu aws-header-menu--right">
              <button type="button" onClick={() => setRegionOpen(false)}>
                Global
              </button>
              <button type="button" onClick={() => setRegionOpen(false)}>
                US East (N. Virginia)
              </button>
              <button type="button" onClick={() => setRegionOpen(false)}>
                US West (Oregon)
              </button>
              <button type="button" onClick={() => setRegionOpen(false)}>
                Asia Pacific (Mumbai)
              </button>
            </div>
          )}
        </div>

        <div className="aws-header-dropdown">
          <button
            type="button"
            className="aws-header-btn aws-header-btn--text"
            onClick={() => {
              setAccountOpen((v) => !v);
              setRegionOpen(false);
              setServicesOpen(false);
            }}
          >
            {displayName}
            <ChevronIcon />
          </button>
          {accountOpen && (
            <div className="aws-header-menu aws-header-menu--right">
              <div className="aws-header-menu__meta">{userEmail}</div>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  onToggleDarkMode();
                }}
              >
                {darkMode ? "Switch to light mode" : "Switch to dark mode"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  onSignOut();
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="aws-icon-btn" aria-label={label} onClick={onClick} title={label}>
      {children}
    </button>
  );
}

function ServicesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <rect x="1" y="1" width="4" height="4" rx="0.5" />
      <rect x="6" y="1" width="4" height="4" rx="0.5" />
      <rect x="11" y="1" width="4" height="4" rx="0.5" />
      <rect x="1" y="6" width="4" height="4" rx="0.5" />
      <rect x="6" y="6" width="4" height="4" rx="0.5" />
      <rect x="11" y="6" width="4" height="4" rx="0.5" />
      <rect x="1" y="11" width="4" height="4" rx="0.5" />
      <rect x="6" y="11" width="4" height="4" rx="0.5" />
      <rect x="11" y="11" width="4" height="4" rx="0.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="aws-search__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloudShellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9L10 12L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 2 6H4c.5-1 2-2.5 2-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 9.5a2.5 2.5 0 1 1 3.8 2.1c-.8.5-1.3 1-1.3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
