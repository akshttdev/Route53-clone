"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DNSRecord } from "@/types/dns-record";

import { RecordActions } from "./record-actions";
import { RecordTypeBadge } from "./record-type-badge";

interface DNSRecordTableProps {
  records: DNSRecord[];
  loading?: boolean;

  onEdit?: (record: DNSRecord) => void;
  onDelete?: (record: DNSRecord) => void;
}

export function DNSRecordTable({
  records,
  loading,
  onEdit,
  onDelete,
}: DNSRecordTableProps) {
  if (loading) {
    return (
      <div className="rounded-none border p-8 text-center text-sm text-muted-foreground">
        Loading DNS Records...
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="rounded-none border p-12 text-center">
        <h3 className="font-semibold">
          No DNS Records
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Create your first DNS Record.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-none border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>

            <TableHead>Type</TableHead>

            <TableHead>Value</TableHead>

            <TableHead>TTL</TableHead>

            <TableHead>Routing Policy</TableHead>

            <TableHead className="w-[140px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                {record.name}
              </TableCell>

              <TableCell>
                <RecordTypeBadge
                  type={record.type}
                />
              </TableCell>

              <TableCell className="max-w-[300px] truncate">
                {record.value}
              </TableCell>

              <TableCell>
                {record.ttl}
              </TableCell>

              <TableCell>
                {record.routingPolicy ??
                  "Simple"}
              </TableCell>

              <TableCell>
                <RecordActions
                  record={record}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}