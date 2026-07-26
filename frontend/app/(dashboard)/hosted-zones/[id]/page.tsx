"use client";

import dynamic from "next/dynamic";
import Box from "@cloudscape-design/components/box";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

const HostedZoneDetailPage = dynamic(
  () => import("@/components/hosted-zones/hosted-zone-detail-page"),
  {
    ssr: false,
    loading: () => (
      <Box textAlign="center" padding="xxl">
        <StatusIndicator type="loading">Loading hosted zone…</StatusIndicator>
      </Box>
    ),
  }
);

export default function Page() {
  return <HostedZoneDetailPage />;
}
