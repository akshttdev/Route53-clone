"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Outbound endpoints"
        createLabel="Create outbound endpoint"
        columns={["Name", "VPC", "IP addresses", "Status"]}
        emptyTitle="No outbound endpoints"
        emptyDescription="There are no outbound endpoints created for this account."
      />
    </ClientOnly>
  );
}
