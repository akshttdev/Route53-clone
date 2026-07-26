"use client";

import dynamic from "next/dynamic";
import Box from "@cloudscape-design/components/box";
import StatusIndicator from "@cloudscape-design/components/status-indicator";

const CreateHostedZonePage = dynamic(
  () => import("@/components/hosted-zones/create-hosted-zone-page"),
  {
    ssr: false,
    loading: () => (
      <Box textAlign="center" padding="xxl">
        <StatusIndicator type="loading">Loading…</StatusIndicator>
      </Box>
    ),
  }
);

export default function Page() {
  return <CreateHostedZonePage />;
}
