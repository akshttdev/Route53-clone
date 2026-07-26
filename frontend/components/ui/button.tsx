import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-none font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#FF9900]/30 disabled:pointer-events-none disabled:opacity-50",

          {
            "border border-[#e47911] bg-[#FF9900] text-[#16191F] hover:bg-[#EC7211] hover:border-[#eb5f07]":
              variant === "primary",

            "border border-[#687078] bg-white text-[#16191F] hover:bg-[#F2F3F3] hover:border-[#545b64]":
              variant === "secondary",

            "bg-red-600 text-white hover:bg-red-700":
              variant === "danger",

            "text-[#16191F] hover:bg-[#F2F3F3]":
              variant === "ghost",

            "h-8 px-3 text-sm": size === "sm",

            "h-10 px-4 text-sm": size === "md",

            "h-11 px-6 text-base": size === "lg",

            "h-10 w-10 p-0": size === "icon",
          }
        ),
        className
      )}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}

      {children}
    </button>
  );
}