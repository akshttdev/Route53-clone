"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";

import { DNSRecord } from "@/types/dns-record";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecordActionsProps {
  record: DNSRecord;
  onView?: (record: DNSRecord) => void;
  onEdit?: (record: DNSRecord) => void;
  onDuplicate?: (record: DNSRecord) => void;
  onDelete?: (record: DNSRecord) => void;
}

export function RecordActions({
  record,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: RecordActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="sm"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => onView?.(record)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onEdit?.(record)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Record
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onDuplicate?.(record)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => onDelete?.(record)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}