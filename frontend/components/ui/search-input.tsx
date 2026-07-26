"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function SearchInput({
  value,
  placeholder = "Search...",
  onChange,
}: SearchInputProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        placeholder={placeholder}
        className="pl-9 pr-9"
        onChange={(e) => onChange(e.target.value)}
      />

      {value && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}