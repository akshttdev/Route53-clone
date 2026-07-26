"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Rules"
        createLabel="Create rule"
        columns={["Name", "Type", "Domain name", "Status"]}
        emptyTitle="No resolver rules"
        emptyDescription="There are no resolver rules created for this account."
      />
    </ClientOnly>
  );
}
