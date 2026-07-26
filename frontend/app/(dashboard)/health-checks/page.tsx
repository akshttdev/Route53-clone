"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Health checks"
        createLabel="Create health check"
        columns={["Name", "Protocol", "Endpoint", "Status"]}
        emptyTitle="No health checks"
        emptyDescription="There are no health checks created for this account."
      />
    </ClientOnly>
  );
}
