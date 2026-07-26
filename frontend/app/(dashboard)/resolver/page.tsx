"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Resolver"
        description="Manage DNS resolution for your VPCs."
        columns={["Resource", "Count", "Status"]}
        emptyTitle="Resolver overview"
        emptyDescription="Use the sidebar to open VPCs, endpoints, and rules."
      />
    </ClientOnly>
  );
}
