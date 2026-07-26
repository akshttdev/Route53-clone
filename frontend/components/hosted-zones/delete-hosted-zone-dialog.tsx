"use client"

import { HostedZone } from "@/types/hosted-zone"

import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  hostedZone: HostedZone | null
  onClose: () => void
  onDelete: () => void
  loading?: boolean
}

export function DeleteHostedZoneDialog({
  open,
  hostedZone,
  onClose,
  onDelete,
  loading,
}: Props) {
  if (!open || !hostedZone) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#16191F]">
          Delete Hosted Zone
        </h2>

        <p className="mt-4 text-sm text-[#5F6B7A]">
          Are you sure you want to delete this hosted zone? This action cannot be undone.
        </p>

        <div className="mt-3 rounded-md bg-red-50 p-3">
          <p className="font-mono text-sm font-semibold text-red-900">
            {hostedZone.name}
          </p>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}