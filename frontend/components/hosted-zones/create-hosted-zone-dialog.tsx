"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description?: string }) => void
  loading?: boolean
}

export function CreateHostedZoneDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (!open) {
      setName("")
      setDescription("")
    }
  }, [open])

  const handleSubmit = () => {
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-xl font-semibold text-[#16191F]">
          Create Hosted Zone
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#16191F]">
              Domain Name
            </label>
            <Input
              placeholder="example.com"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#16191F]">
              Description (Optional)
            </label>
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
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
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  )
}