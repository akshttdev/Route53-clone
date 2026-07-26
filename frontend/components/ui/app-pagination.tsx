"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;

  onPrevious: () => void;
  onNext: () => void;
}

export function AppPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="mt-6 flex items-center justify-between border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={onPrevious}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="secondary"
          disabled={page === totalPages}
          onClick={onNext}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}