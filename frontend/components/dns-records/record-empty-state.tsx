"use client";

import { Database } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onCreate?: () => void;
}

export function RecordEmptyState({
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-none border border-dashed py-20">
      <Database className="mb-4 h-12 w-12 text-muted-foreground" />

      <h3 className="text-lg font-semibold">
        No DNS Records
      </h3>

      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        This hosted zone doesn't contain any DNS records yet.
      </p>

      <Button
        className="mt-6"
        onClick={onCreate}
      >
        Create your first record
      </Button>
    </div>
  );
}