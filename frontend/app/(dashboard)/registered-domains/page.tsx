"use client";

import { ClientOnly } from "@/components/common/client-only";
import { Route53PlaceholderPage } from "@/components/common/route53-placeholder-page";

export default function Page() {
  return (
    <ClientOnly>
      <Route53PlaceholderPage
        title="Registered domains"
        createLabel="Register domain"
        columns={["Domain name", "Expires", "Auto renew", "Transfer lock"]}
        emptyTitle="No registered domains"
        emptyDescription="There are no domains registered in this account."
      />
    </ClientOnly>
  );
}
