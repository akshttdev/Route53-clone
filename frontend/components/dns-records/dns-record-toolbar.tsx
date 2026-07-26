"use client"

import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DNSRecordToolbarProps {
  search: string
  typeFilter?: string
  onSearchChange: (value: string) => void
  onTypeFilterChange?: (value: string) => void
  onCreate?: () => void
}

export function DNSRecordToolbar({
  search,
  typeFilter = "",
  onSearchChange,
  onTypeFilterChange,
  onCreate,
}: DNSRecordToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B7A]" />

          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records..."
            className="pl-9"
          />
        </div>

        {onTypeFilterChange && (
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="h-10 rounded-none border border-[#D5DBDB] bg-white px-3 text-sm text-[#16191F] focus:border-[#0972D3] focus:outline-none focus:ring-2 focus:ring-[#0972D3]/20"
          >
            <option value="">All Types</option>
            <option value="A">A</option>
            <option value="AAAA">AAAA</option>
            <option value="CNAME">CNAME</option>
            <option value="MX">MX</option>
            <option value="TXT">TXT</option>
            <option value="NS">NS</option>
            <option value="SOA">SOA</option>
            <option value="SRV">SRV</option>
            <option value="CAA">CAA</option>
            <option value="PTR">PTR</option>
          </select>
        )}
      </div>

      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Record
      </Button>
    </div>
  )
}