"use client";

import { useEffect, useState } from "react";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Box from "@cloudscape-design/components/box";

export function ClientOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      fallback ?? (
        <Box textAlign="center" padding="xxl">
          <StatusIndicator type="loading">Loading console…</StatusIndicator>
        </Box>
      )
    );
  }

  return <>{children}</>;
}
