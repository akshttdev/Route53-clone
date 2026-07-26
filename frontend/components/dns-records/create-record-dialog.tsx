"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; type: string; value: string; ttl: number }) => void
  loading?: boolean
}

export function CreateRecordDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    type: "A",
    value: "",
    ttl: "300",
  })

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        type: "A",
        value: "",
        ttl: "300",
      })
    }
  }, [open])

  const handleSubmit = () => {
    if (!form.name.trim() || !form.value.trim()) return

    onSubmit({
      name: form.name.trim(),
      type: form.type,
      value: form.value.trim(),
      ttl: parseInt(form.ttl) || 300,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-none bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-xl font-semibold text-[#16191F]">
          Create DNS Record
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#16191F]">
              Record Name
            </label>
            <Input
              placeholder="www.example.com"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#16191F]">
              Record Type
            </label>
            <select
              className="h-10 w-full rounded-none border border-[#D5DBDB] bg-white px-3 text-sm text-[#16191F] focus:border-[#0972D3] focus:outline-none focus:ring-2 focus:ring-[#0972D3]/20"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
              disabled={loading}
            >
              <option>A</option>
              <option>AAAA</option>
              <option>CNAME</option>
              <option>MX</option>
              <option>TXT</option>
              <option>NS</option>
              <option>PTR</option>
              <option>CAA</option>
              <option>SOA</option>
              <option>SRV</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#16191F]">
              Value
            </label>
            <Input
              placeholder="192.0.2.1"
              value={form.value}
              onChange={(e) =>
                setForm({
                  ...form,
                  value: e.target.value,
                })
              }
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#16191F]">
              TTL (seconds)
            </label>
            <Input
              placeholder="300"
              type="number"
              value={form.ttl}
              onChange={(e) =>
                setForm({
                  ...form,
                  ttl: e.target.value,
                })
              }
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
            disabled={loading || !form.name.trim() || !form.value.trim()}
          >
            {loading ? "Creating..." : "Create Record"}
          </Button>
        </div>
      </div>
    </div>
  )
}