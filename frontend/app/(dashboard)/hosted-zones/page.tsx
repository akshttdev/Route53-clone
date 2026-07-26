"use client";

import dynamic from "next/dynamic";
import Box from "@cloudscape-design/components/box";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

const HostedZonesPage = dynamic(
  () => import("@/components/hosted-zones/hosted-zones-page"),
  {
    ssr: false,
    loading: () => (
      <Box textAlign="center" padding="xxl">
        <StatusIndicator type="loading">Loading hosted zones…</StatusIndicator>
      </Box>
    ),
  }
);

export default function Page() {
  return <HostedZonesPage />;
}
