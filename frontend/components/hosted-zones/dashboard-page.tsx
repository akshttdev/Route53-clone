"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@cloudscape-design/components/header";
import Container from "@cloudscape-design/components/container";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Link from "@cloudscape-design/components/link";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Input from "@cloudscape-design/components/input";
import FormField from "@cloudscape-design/components/form-field";
import { toast } from "sonner";
import { useHostedZones } from "@/hooks/use-hosted-zones";

export default function DashboardPage() {
  const router = useRouter();
  const { data } = useHostedZones({ page: 1, page_size: 1 });
  const zoneCount = data?.total ?? 0;
  const [domain, setDomain] = useState("");

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: "Route 53", href: "/dashboard" },
          { text: "Dashboard", href: "#" },
        ]}
        onFollow={(e) => {
          e.preventDefault();
          if (e.detail.href !== "#") router.push(e.detail.href);
        }}
      />

      <Header variant="h1" info={<Link href="#">Info</Link>}>
        Route 53 Dashboard
      </Header>

      <Container>
        <ColumnLayout columns={2} variant="text-grid">
          <SpaceBetween size="l">
            <div>
              <Box variant="h3">DNS management</Box>
              <Box variant="p" color="text-body-secondary" padding={{ bottom: "s" }}>
                Create and manage public and private hosted zones.
              </Box>
              <Link
                href="/hosted-zones"
                onFollow={(e) => {
                  e.preventDefault();
                  router.push("/hosted-zones");
                }}
              >
                {zoneCount} Hosted zone{zoneCount === 1 ? "" : "s"}
              </Link>
            </div>

            <div>
              <Box variant="h3">Availability monitoring</Box>
              <Box variant="p" color="text-body-secondary" padding={{ bottom: "s" }}>
                Monitor the health of your resources.
              </Box>
              <Button onClick={() => router.push("/health-checks")}>
                Create health check
              </Button>
            </div>

            <div>
              <Box variant="h3">Readiness check</Box>
              <Box variant="p" color="text-body-secondary" padding={{ bottom: "s" }}>
                Check whether your recovery groups are ready.
              </Box>
              <Link href="#">0 Readiness checks</Link>
            </div>
          </SpaceBetween>

          <SpaceBetween size="l">
            <div>
              <Box variant="h3">Traffic management</Box>
              <Box variant="p" color="text-body-secondary" padding={{ bottom: "s" }}>
                Route traffic based on policies and endpoints.
              </Box>
              <Link
                href="/policy-records"
                onFollow={(e) => {
                  e.preventDefault();
                  router.push("/policy-records");
                }}
              >
                0 Policy records
              </Link>
            </div>

            <div>
              <Box variant="h3">Domain registration</Box>
              <Box variant="p" color="text-body-secondary" padding={{ bottom: "s" }}>
                Register and transfer domains.
              </Box>
              <Button onClick={() => router.push("/registered-domains")}>
                Register domain
              </Button>
            </div>

            <div>
              <Box variant="h3">Routing control</Box>
              <Box variant="p" color="text-body-secondary" padding={{ bottom: "s" }}>
                Manage routing controls for application recovery.
              </Box>
              <Link href="#">0 Control panels</Link>
            </div>
          </SpaceBetween>
        </ColumnLayout>
      </Container>

      <Container
        header={<Header variant="h2">Register domain</Header>}
      >
        <SpaceBetween size="s">
          <Box variant="p" color="text-body-secondary">
            Enter a domain name to check availability.
          </Box>
          <FormField>
            <SpaceBetween direction="horizontal" size="xs">
              <Input
                value={domain}
                onChange={({ detail }) => setDomain(detail.value)}
                placeholder="Enter a domain name"
              />
              <Button
                onClick={() => {
                  if (!domain.trim()) return;
                  toast.success(`Checked ${domain.trim()}`, {
                    description:
                      "Availability check is mocked — domain registration is not live.",
                  });
                }}
                disabled={!domain.trim()}
              >
                Check
              </Button>
            </SpaceBetween>
          </FormField>
        </SpaceBetween>
      </Container>

      <Container header={<Header variant="h2">More resources</Header>}>
        <SpaceBetween size="xs">
          <Link external href="https://docs.aws.amazon.com/route53/">
            Documentation
          </Link>
          <Link external href="https://docs.aws.amazon.com/Route53/latest/APIReference/">
            API reference
          </Link>
          <Link href="/hosted-zones">Hosted zones</Link>
          <Link href="/health-checks">Health checks</Link>
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
}
