"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Requests"
        columns={["Domain", "Type", "Status", "Submitted"]}
        emptyTitle="No domain requests"
        emptyDescription="There are no pending domain registration or transfer requests."
      />
    </ClientOnly>
  );
}
