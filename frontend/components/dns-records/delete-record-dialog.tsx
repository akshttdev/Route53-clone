"use client"

import { Button } from "@/components/ui/button"

import { DNSRecord } from "@/types/dns-record"

interface Props {
  open: boolean
  record: DNSRecord | null
  onClose: () => void
  onDelete: () => void
  loading?: boolean
}

export function DeleteRecordDialog({
  open,
  record,
  onClose,
  onDelete,
  loading,
}: Props) {
  if (!open || !record) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-none bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[#16191F]">
          Delete DNS Record
        </h2>

        <p className="mt-4 text-sm text-[#5F6B7A]">
          Are you sure you want to delete this DNS record?
        </p>

        <div className="mt-3 rounded-none bg-red-50 p-3">
          <p className="text-sm">
            <span className="font-semibold text-red-900">{record.name}</span>
            <span className="text-red-700"> ({record.type})</span>
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