"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Inbound endpoints"
        createLabel="Create inbound endpoint"
        columns={["Name", "VPC", "IP addresses", "Status"]}
        emptyTitle="No inbound endpoints"
        emptyDescription="There are no inbound endpoints created for this account."
      />
    </ClientOnly>
  );
}
