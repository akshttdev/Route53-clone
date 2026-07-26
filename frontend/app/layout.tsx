import type { Metadata } from "next";
import "@cloudscape-design/global-styles/index.css";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";
import { ClientToaster } from "@/components/providers/client-toaster";

export const metadata: Metadata = {
  title: "Route 53 Console",
  description: "AWS Route 53 Clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          fontFamily:
            '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
          margin: 0,
        }}
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <ClientToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
