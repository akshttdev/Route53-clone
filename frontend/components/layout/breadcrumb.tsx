import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.label} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[#0972D3] hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "font-medium text-[#16191F]"
                    : "text-[#0972D3]"
                }
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight className="h-4 w-4 text-[#687078]" />
            )}
          </div>
        );
      })}
    </nav>
  );
}