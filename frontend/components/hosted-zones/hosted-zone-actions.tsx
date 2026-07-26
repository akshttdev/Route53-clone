"use client";

import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onCreateRecord?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function HostedZoneActions({
  onCreateRecord,
  onDelete,
  onEdit,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={onCreateRecord}>
        <Plus className="mr-2 h-4 w-4" />
        Create Record
      </Button>

      <Button
        variant="secondary"
        onClick={onEdit}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit Zone
      </Button>

      <Button
        variant="danger"
        onClick={onDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Zone
      </Button>
    </div>
  );
}