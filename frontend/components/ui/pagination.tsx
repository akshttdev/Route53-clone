import * as React from "react";

import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function PaginationItem(
  props: React.ComponentProps<"li">
) {
  return <li {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

function PaginationLink({
  className,
  isActive,
  children,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(className)}
      {...props}
    >
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size="icon"
      >
        {children}
      </Button>
    </a>
  );
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: PaginationLinkProps & {
  text?: string;
}) {
  return (
    <a
      aria-label="Go to previous page"
      className={cn(className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="md"
      >
        <ChevronLeftIcon className="mr-2 h-4 w-4" />
        {text}
      </Button>
    </a>
  );
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: PaginationLinkProps & {
  text?: string;
}) {
  return (
    <a
      aria-label="Go to next page"
      className={cn(className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="md"
      >
        {text}
        <ChevronRightIcon className="ml-2 h-4 w-4" />
      </Button>
    </a>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 items-center justify-center",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};