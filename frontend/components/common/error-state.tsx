"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Props {
  title?: string
  message?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  message,
  description = "Please try again.",
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#D5DBDB] bg-white py-20">
      <AlertTriangle className="mb-5 h-10 w-10 text-[#D13212]" />

      <h2 className="text-xl font-semibold text-[#16191F]">
        {title}
      </h2>

      <p className="mt-2 text-sm text-[#5F6B7A]">
        {message || description}
      </p>

      {onRetry && (
        <Button
          className="mt-6"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  )
}