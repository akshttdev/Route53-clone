"use client"

import { useState } from "react"
import {
  Globe,
  Lock,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

import { HostedZone } from "@/types/hosted-zone"

interface Props {
  zones: HostedZone[]

  onView?: (zone: HostedZone) => void
  onEdit?: (zone: HostedZone) => void
  onDelete?: (zone: HostedZone) => void
}

export function HostedZoneTable({
  zones,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const [openMenu, setOpenMenu] = useState<string | number | null>(null)

  if (!zones.length) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-[#5F6B7A]">No Hosted Zones Found</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#D5DBDB] bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Domain</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Records</TableHead>
            <TableHead>Description</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {zones.map((zone) => (
            <TableRow
              key={zone.id}
              className="cursor-pointer hover:bg-[#F2F3F3]"
              onClick={() => onView?.(zone)}
            >
              <TableCell className="font-medium text-[#0972D3]">
                {zone.name}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  {zone.type === "Public" ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-orange-600" />
                  )}

                  <span className="text-[#16191F]">{zone.type}</span>
                </div>
              </TableCell>

              <TableCell className="text-[#16191F]">
                {zone.recordCount}
              </TableCell>

              <TableCell className="text-[#5F6B7A]">
                {zone.description || "-"}
              </TableCell>

              <TableCell
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOpenMenu(openMenu === zone.id ? null : zone.id)
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {openMenu === zone.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div className="absolute right-0 top-10 z-50 w-40 rounded-lg border border-[#D5DBDB] bg-white shadow-lg">
                        <button
                          onClick={() => {
                            setOpenMenu(null)
                            onEdit?.(zone)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#16191F] hover:bg-[#F2F3F3]"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setOpenMenu(null)
                            onDelete?.(zone)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}