"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="CIDR collections"
        createLabel="Create CIDR collection"
        columns={["Name", "CIDR blocks", "Description"]}
        emptyTitle="No CIDR collections"
        emptyDescription="There are no CIDR collections created for this account."
      />
    </ClientOnly>
  );
}
