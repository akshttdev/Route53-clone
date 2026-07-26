"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Profiles"
        createLabel="Create profile"
        columns={["Name", "Status", "Description"]}
        emptyTitle="No profiles"
        emptyDescription="There are no Route 53 Profiles created for this account."
      />
    </ClientOnly>
  );
}
