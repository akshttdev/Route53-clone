"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Traffic policies"
        createLabel="Create traffic policy"
        columns={["Name", "Version", "Type", "Description"]}
        emptyTitle="No traffic policies"
        emptyDescription="There are no traffic policies created for this account."
      />
    </ClientOnly>
  );
}
