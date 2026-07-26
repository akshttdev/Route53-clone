"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

interface HostedZoneToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate?: () => void;
}

export function HostedZoneToolbar({
  search,
  onSearchChange,
  onCreate,
}: HostedZoneToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <SearchInput
        value={search}
        placeholder="Search hosted zones..."
        onChange={onSearchChange}
      />

      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Hosted Zone
      </Button>
    </div>
  );
}