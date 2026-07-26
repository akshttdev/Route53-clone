"use client";

import { ClientOnly } from "@/components/common/client-only";
import DashboardPage from "@/components/hosted-zones/dashboard-page";

export default function Page() {
  return (
    <ClientOnly>
      <DashboardPage />
    </ClientOnly>
  );
}
