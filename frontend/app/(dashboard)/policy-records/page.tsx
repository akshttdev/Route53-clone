"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Policy records"
        createLabel="Create policy record"
        columns={["Policy", "Record name", "Type", "TTL"]}
        emptyTitle="No policy records"
        emptyDescription="There are no policy records created for this account."
      />
    </ClientOnly>
  );
}
