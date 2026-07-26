import {
  Activity,
  ArrowRightLeft,
  Database,
  Globe,
  HeartPulse,
  LayoutDashboard,
  Network,
  Search,
  Server,
  Shield,
  Workflow,
} from "lucide-react"

export interface SidebarItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "DNS Management",
    items: [
      {
        label: "Hosted zones",
        href: "/hosted-zones",
        icon: Globe,
      },
    ],
  },
  {
    title: "Routing",
    items: [
      {
        label: "Traffic policies",
        href: "/traffic-policies",
        icon: ArrowRightLeft,
      },
      {
        label: "Health checks",
        href: "/health-checks",
        icon: HeartPulse,
      },
    ],
  },
  {
    title: "Resolver",
    items: [
      {
        label: "Resolver",
        href: "/resolver",
        icon: Network,
      },
      {
        label: "Profiles",
        href: "/profiles",
        icon: Database,
      },
    ],
  },
]