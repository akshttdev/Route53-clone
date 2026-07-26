"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="VPCs"
        columns={["VPC ID", "Region", "Resolver rules", "Status"]}
        emptyTitle="No VPCs"
        emptyDescription="No VPCs are associated with Resolver in this mock console."
      />
    </ClientOnly>
  );
}
