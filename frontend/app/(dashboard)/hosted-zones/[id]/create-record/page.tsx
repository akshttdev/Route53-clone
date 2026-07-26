"use client";

import dynamic from "next/dynamic";

const QuickCreateRecordPage = dynamic(
  () => import("@/components/hosted-zones/quick-create-record-page"),
  { ssr: false }
);

export default function Page() {
  return <QuickCreateRecordPage />;
}
