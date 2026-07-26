import Link from "next/link";
import { ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb: BreadcrumbItemType[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8 border-b border-[#D5DBDB] pb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex items-center"
              >
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={item.href ?? "#"} />}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="max-w-3xl">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#16191F]">
            {title}
          </h1>

          {description && (
            <p className="mt-2 text-[14px] leading-6 text-[#5F6B7A]">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}