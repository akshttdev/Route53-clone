"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Container from "@cloudscape-design/components/container";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Textarea from "@cloudscape-design/components/textarea";
import Toggle from "@cloudscape-design/components/toggle";
import Link from "@cloudscape-design/components/link";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Alert from "@cloudscape-design/components/alert";

import { useHostedZone } from "@/hooks/use-hosted-zones";
import { useCreateDNSRecord } from "@/hooks/use-create-dns-record";
import { DNSRecord } from "@/types/dns-record";

const RECORD_TYPE_OPTIONS = [
  {
    label: "A – Routes traffic to an IPv4 address and some AWS resources",
    value: "A",
  },
  {
    label: "AAAA – Routes traffic to an IPv6 address and some AWS resources",
    value: "AAAA",
  },
  {
    label: "CNAME – Routes traffic to another domain name",
    value: "CNAME",
  },
  { label: "MX – Routes traffic to mail servers", value: "MX" },
  { label: "TXT – Used for verification / SPF", value: "TXT" },
  { label: "NS – Name servers for a hosted zone / subdomain", value: "NS" },
  { label: "SRV – Routes traffic for services", value: "SRV" },
  { label: "CAA – Specifies CAs that can issue certificates", value: "CAA" },
  { label: "PTR – Reverse DNS lookup", value: "PTR" },
];

const ROUTING_OPTIONS = [
  { label: "Simple routing", value: "simple" },
  { label: "Weighted routing", value: "weighted" },
  { label: "Latency routing", value: "latency" },
  { label: "Failover routing", value: "failover" },
  { label: "Geolocation routing", value: "geolocation" },
  { label: "Multivalue answer routing", value: "multivalue" },
];

type DraftRecord = {
  id: string;
  name: string;
  type: (typeof RECORD_TYPE_OPTIONS)[number];
  value: string;
  ttl: string;
  alias: boolean;
  routing: (typeof ROUTING_OPTIONS)[number];
};

function emptyDraft(): DraftRecord {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: RECORD_TYPE_OPTIONS[0],
    value: "",
    ttl: "300",
    alias: false,
    routing: ROUTING_OPTIONS[0],
  };
}

export default function QuickCreateRecordPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.id as string;

  const { data: hostedZone, isLoading } = useHostedZone(zoneId);
  const createMutation = useCreateDNSRecord();
  const [drafts, setDrafts] = useState<DraftRecord[]>([emptyDraft()]);
  const [submitting, setSubmitting] = useState(false);

  const zoneSuffix = useMemo(() => {
    if (!hostedZone?.name) return "";
    return hostedZone.name.endsWith(".")
      ? `.${hostedZone.name.slice(0, -1)}`
      : `.${hostedZone.name}`;
  }, [hostedZone?.name]);

  const updateDraft = (id: string, patch: Partial<DraftRecord>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const handleCreate = async () => {
    if (!hostedZone) return;
    const base = hostedZone.name.replace(/\.$/, "");

    for (const draft of drafts) {
      if (!draft.value.trim()) {
        toast.error("Each record needs a value");
        return;
      }
    }

    setSubmitting(true);
    try {
      for (const draft of drafts) {
        const fullName = draft.name.trim()
          ? `${draft.name.trim()}.${base}`
          : base;
        await createMutation.mutateAsync({
          hostedZoneId: zoneId,
          data: {
            name: fullName,
            type: draft.type.value as DNSRecord["type"],
            value: draft.value,
            ttl: draft.alias ? 60 : Number(draft.ttl) || 300,
          },
        });
      }
      toast.success(
        drafts.length === 1
          ? "Record created"
          : `${drafts.length} records created`
      );
      router.push(`/hosted-zones/${zoneId}`);
    } catch {
      toast.error("Failed to create record(s)");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <StatusIndicator type="loading">Loading hosted zone</StatusIndicator>;
  }

  if (!hostedZone) {
    return <Alert type="error">Unable to load hosted zone.</Alert>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
      }}
    >
      <Form
        header={
          <SpaceBetween size="m">
            <BreadcrumbGroup
              items={[
                { text: "Route 53", href: "/dashboard" },
                { text: "Hosted zones", href: "/hosted-zones" },
                { text: hostedZone.name, href: `/hosted-zones/${zoneId}` },
                { text: "Create record", href: "#" },
              ]}
              onFollow={(e) => {
                e.preventDefault();
                if (e.detail.href !== "#") router.push(e.detail.href);
              }}
            />
            <Header
              variant="h1"
              info={<Link href="#">Info</Link>}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Link href="#">Switch to wizard</Link>
                  <Button
                    onClick={() => setDrafts((prev) => [...prev, emptyDraft()])}
                  >
                    Add another record
                  </Button>
                </SpaceBetween>
              }
            >
              Quick create record
            </Header>
          </SpaceBetween>
        }
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={() => router.push(`/hosted-zones/${zoneId}`)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              formAction="submit"
            >
              Create records
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {drafts.map((draft, index) => (
            <Container key={draft.id}>
              <ExpandableSection
                headerText={`Record ${index + 1}`}
                defaultExpanded
                variant="container"
                headerActions={
                  <Button
                    disabled={drafts.length === 1}
                    onClick={() =>
                      setDrafts((prev) => prev.filter((d) => d.id !== draft.id))
                    }
                  >
                    Delete
                  </Button>
                }
              >
                <ColumnLayout columns={2}>
                  <FormField
                    label="Record name"
                    info={<Link href="#">Info</Link>}
                    description="Keep blank for the root domain."
                    secondaryControl={
                      <Box padding={{ top: "xxs" }} color="text-body-secondary">
                        {zoneSuffix}
                      </Box>
                    }
                  >
                    <Input
                      value={draft.name}
                      onChange={({ detail }) =>
                        updateDraft(draft.id, { name: detail.value })
                      }
                      placeholder="blog"
                    />
                  </FormField>

                  <FormField label="Record type" info={<Link href="#">Info</Link>}>
                    <Select
                      selectedOption={draft.type}
                      onChange={({ detail }) =>
                        updateDraft(draft.id, {
                          type: detail.selectedOption as DraftRecord["type"],
                        })
                      }
                      options={RECORD_TYPE_OPTIONS}
                    />
                  </FormField>

                  <FormField
                    label="Value"
                    info={<Link href="#">Info</Link>}
                    description="Enter multiple values on separate lines."
                    secondaryControl={
                      <Toggle
                        checked={draft.alias}
                        onChange={({ detail }) =>
                          updateDraft(draft.id, { alias: detail.checked })
                        }
                      >
                        Alias
                      </Toggle>
                    }
                  >
                    <Textarea
                      value={draft.value}
                      onChange={({ detail }) =>
                        updateDraft(draft.id, { value: detail.value })
                      }
                      rows={4}
                      placeholder="192.0.2.0"
                    />
                  </FormField>

                  <SpaceBetween size="l">
                    <FormField
                      label="TTL (seconds)"
                      info={<Link href="#">Info</Link>}
                      description="Recommended values: 60 to 172800 (two days)"
                    >
                      <SpaceBetween size="xs">
                        <Input
                          value={draft.ttl}
                          onChange={({ detail }) =>
                            updateDraft(draft.id, { ttl: detail.value })
                          }
                          disabled={draft.alias}
                        />
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button
                            className={
                              draft.ttl === "60"
                                ? "aws-ttl-chip-selected"
                                : undefined
                            }
                            onClick={() => updateDraft(draft.id, { ttl: "60" })}
                            disabled={draft.alias}
                          >
                            1m
                          </Button>
                          <Button
                            className={
                              draft.ttl === "3600"
                                ? "aws-ttl-chip-selected"
                                : undefined
                            }
                            onClick={() =>
                              updateDraft(draft.id, { ttl: "3600" })
                            }
                            disabled={draft.alias}
                          >
                            1h
                          </Button>
                          <Button
                            className={
                              draft.ttl === "86400"
                                ? "aws-ttl-chip-selected"
                                : undefined
                            }
                            onClick={() =>
                              updateDraft(draft.id, { ttl: "86400" })
                            }
                            disabled={draft.alias}
                          >
                            1d
                          </Button>
                        </SpaceBetween>
                      </SpaceBetween>
                    </FormField>

                    <FormField
                      label="Routing policy"
                      info={<Link href="#">Info</Link>}
                    >
                      <Select
                        selectedOption={draft.routing}
                        onChange={({ detail }) =>
                          updateDraft(draft.id, {
                            routing:
                              detail.selectedOption as DraftRecord["routing"],
                          })
                        }
                        options={ROUTING_OPTIONS}
                      />
                    </FormField>
                  </SpaceBetween>
                </ColumnLayout>
              </ExpandableSection>
            </Container>
          ))}
        </SpaceBetween>
      </Form>
    </form>
  );
}
