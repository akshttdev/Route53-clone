"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCollection } from "@cloudscape-design/collection-hooks";

import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Container from "@cloudscape-design/components/container";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import Modal from "@cloudscape-design/components/modal";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Select from "@cloudscape-design/components/select";
import Textarea from "@cloudscape-design/components/textarea";
import Tabs from "@cloudscape-design/components/tabs";
import Badge from "@cloudscape-design/components/badge";
import Link from "@cloudscape-design/components/link";
import Alert from "@cloudscape-design/components/alert";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Toggle from "@cloudscape-design/components/toggle";
import Drawer from "@cloudscape-design/components/drawer";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";

import { useHostedZone } from "@/hooks/use-hosted-zones";
import { useDNSRecords } from "@/hooks/use-dns-records";
import { useUpdateDNSRecord } from "@/hooks/use-update-dns-record";
import { useDeleteHostedZone } from "@/hooks/use-delete-hosted-zone";
import { useUpdateHostedZone } from "@/hooks/use-update-hosted-zone";
import { DNSRecord } from "@/types/dns-record";
import { DNSRecordService } from "@/services/dns-record.service";
import { useSplitPanel } from "@/components/layout/split-panel-context";
import SearchModeBanner from "@/components/common/search-mode-banner";

const RECORD_TYPES = [
  "A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA", "SRV", "PTR", "CAA",
].map((t) => ({ label: t, value: t }));

const ROUTING_FILTER = [
  { label: "Routing policy", value: "" },
  { label: "Simple", value: "Simple" },
];

const ALIAS_FILTER = [
  { label: "Alias", value: "" },
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

function recordAlias(item: DNSRecord) {
  return item.value.toLowerCase().includes("alias") ? "Yes" : "No";
}

export default function HostedZoneDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.id as string;
  const { setSplitPanel, closeSplitPanel } = useSplitPanel();

  const [page, setPage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteZoneOpen, setDeleteZoneOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editZoneOpen, setEditZoneOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [queryLogOpen, setQueryLogOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<DNSRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [recordName, setRecordName] = useState("");
  const [recordType, setRecordType] = useState(RECORD_TYPES[0]);
  const [recordValue, setRecordValue] = useState("");
  const [recordTtl, setRecordTtl] = useState("300");
  const [alias, setAlias] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [routingFilter, setRoutingFilter] = useState("");
  const [aliasFilter, setAliasFilter] = useState("");
  const [importContent, setImportContent] = useState("");
  const [filterText, setFilterText] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [editZoneName, setEditZoneName] = useState("");
  const [editZoneDescription, setEditZoneDescription] = useState("");
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState(RECORD_TYPES[0]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [queryLogEnabled, setQueryLogEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    pageSize: 50,
    visibleContent: [
      "name",
      "type",
      "routing",
      "diff",
      "alias",
      "value",
      "ttl",
      "health",
    ],
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(filterText.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [filterText]);

  const { data: hostedZone, isLoading: zoneLoading } = useHostedZone(zoneId);
  const { data: recordResponse, isLoading: recordsLoading, refetch } = useDNSRecords(
    zoneId,
    {
      page,
      page_size: 50,
      type: typeFilter || undefined,
      q: debouncedQ || undefined,
    }
  );

  const updateMutation = useUpdateDNSRecord();
  const deleteZoneMutation = useDeleteHostedZone();
  const updateZoneMutation = useUpdateHostedZone();

  const items = useMemo(() => {
    let list = recordResponse?.items ?? [];
    if (aliasFilter === "Yes") list = list.filter((r) => recordAlias(r) === "Yes");
    if (aliasFilter === "No") list = list.filter((r) => recordAlias(r) === "No");
    if (routingFilter === "Simple") list = list; // all simple for now
    return list;
  }, [recordResponse?.items, aliasFilter, routingFilter]);

  const totalPages = Math.max(
    1,
    recordResponse ? Math.ceil(recordResponse.total / recordResponse.page_size) : 1
  );

  const { items: filteredItems, collectionProps } = useCollection(
    items,
    {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit">
            <b>No records</b>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit">
            <b>No matches</b>
          </Box>
        ),
      },
      selection: {},
    }
  );

  const nsValues = useMemo(
    () => items.filter((r) => r.type === "NS").map((r) => r.value),
    [items]
  );

  useEffect(() => {
    if (selectedRecords.length === 0) {
      setSplitPanel({
        open: true,
        header: "0 records selected",
        content: (
          <Box color="text-body-secondary" padding="m">
            Select a record to see its details
          </Box>
        ),
      });
      return;
    }

    const record = selectedRecords[0];
    setSplitPanel({
      open: true,
      header:
        selectedRecords.length === 1
          ? "1 record selected"
          : `${selectedRecords.length} records selected`,
      content: (
        <SpaceBetween size="l">
          {selectedRecords.length === 1 ? (
            <ColumnLayout columns={1} variant="text-grid">
              <div>
                <Box variant="awsui-key-label">Record name</Box>
                <div>{record.name}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Type</Box>
                <div>{record.type}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Routing policy</Box>
                <div>Simple</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Alias</Box>
                <div>{recordAlias(record)}</div>
              </div>
              <div>
                <Box variant="awsui-key-label">Value/Route traffic to</Box>
                <Box fontSize="body-s">
                  <div style={{ whiteSpace: "pre-wrap" }}>{record.value}</div>
                </Box>
              </div>
              <div>
                <Box variant="awsui-key-label">TTL (seconds)</Box>
                <div>{record.ttl}</div>
              </div>
            </ColumnLayout>
          ) : (
            <Box>{selectedRecords.length} records selected</Box>
          )}
          {selectedRecords.length === 1 && (
            <Button
              onClick={() => {
                setEditingRecord(record);
                setRecordName(record.name);
                setRecordType({ label: record.type, value: record.type });
                setRecordValue(record.value);
                setRecordTtl(String(record.ttl));
                setAlias(false);
                setEditOpen(true);
              }}
            >
              Edit record
            </Button>
          )}
        </SpaceBetween>
      ),
    });
  }, [selectedRecords, setSplitPanel]);

  useEffect(() => {
    return () => closeSplitPanel();
  }, [closeSplitPanel]);

  const resetForm = () => {
    setRecordName("");
    setRecordType(RECORD_TYPES[0]);
    setRecordValue("");
    setRecordTtl("300");
    setAlias(false);
  };

  const handleEdit = async () => {
    if (!editingRecord) return;
    try {
      await updateMutation.mutateAsync({
        hostedZoneId: zoneId,
        recordId: String(editingRecord.id),
        data: {
          name: recordName,
          type: recordType.value as DNSRecord["type"],
          value: recordValue,
          ttl: Number(recordTtl) || 300,
        },
      });
      toast.success("Record updated");
      setEditOpen(false);
      setEditingRecord(null);
      resetForm();
      refetch();
    } catch {
      toast.error("Failed to update record");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRecords.map((r) => Number(r.id));
      await DNSRecordService.bulkDeleteRecords(zoneId, ids);
      toast.success(`Deleted ${ids.length} record(s)`);
      setSelectedRecords([]);
      setDeleteOpen(false);
      refetch();
    } catch {
      toast.error("Failed to delete records");
    }
  };

  const handleExport = async (format: "json" | "bind") => {
    try {
      const blob = await DNSRecordService.exportZone(zoneId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${hostedZone?.name || "zone"}.${format === "json" ? "json" : "zone"}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    }
  };

  const handleImport = async () => {
    try {
      await DNSRecordService.importZone(zoneId, importContent, false);
      toast.success("Zone file imported");
      setImportOpen(false);
      setImportContent("");
      refetch();
    } catch {
      toast.error("Import failed");
    }
  };

  const handleDeleteZone = async () => {
    try {
      await deleteZoneMutation.mutateAsync(zoneId);
      toast.success("Hosted zone deleted");
      router.push("/hosted-zones");
    } catch {
      toast.error("Failed to delete zone");
    }
  };

  const handleEditZone = async () => {
    try {
      await updateZoneMutation.mutateAsync({
        id: zoneId,
        data: {
          name: editZoneName.trim(),
          description: editZoneDescription.trim() || undefined,
        },
      });
      toast.success("Hosted zone updated");
      setEditZoneOpen(false);
    } catch {
      toast.error("Failed to update hosted zone");
    }
  };

  const runTestRecord = () => {
    const name = testName.trim().toLowerCase();
    const matches = items.filter(
      (r) =>
        r.type === testType.value &&
        (r.name.toLowerCase() === name ||
          r.name.toLowerCase().startsWith(name) ||
          (!name && r.name.toLowerCase().startsWith(hostedZone?.name.toLowerCase() || "")))
    );
    if (matches.length === 0) {
      setTestResult(`NXDOMAIN — no ${testType.value} record matched “${testName || hostedZone?.name}”.`);
    } else {
      setTestResult(
        matches
          .map((m) => `${m.name} ${m.type} ${m.ttl} → ${m.value}`)
          .join("\n")
      );
    }
  };

  if (zoneLoading) {
    return <StatusIndicator type="loading">Loading hosted zone</StatusIndicator>;
  }

  if (!hostedZone) {
    return <Alert type="error">Unable to load hosted zone.</Alert>;
  }

  const recordsTab = (
    <SpaceBetween size="l">
      <Header
        variant="h2"
        counter={
          selectedRecords.length
            ? `(${selectedRecords.length}/${recordResponse?.total ?? 0})`
            : `(${recordResponse?.total ?? 0})`
        }
        info={<Link href="#">Info</Link>}
        description={<SearchModeBanner asDescription />}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button iconName="refresh" onClick={() => refetch()} ariaLabel="Refresh" />
            <Button
              disabled={selectedRecords.length === 0}
              onClick={() => setDeleteOpen(true)}
            >
              Delete records
            </Button>
            <Button onClick={() => setImportOpen(true)}>Import zone file</Button>
            <Button onClick={() => handleExport("bind")}>Export zone file</Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/hosted-zones/${zoneId}/create-record`)}
            >
              Create record
            </Button>
          </SpaceBetween>
        }
      >
        Records
      </Header>

      <Table
        {...collectionProps}
        loading={recordsLoading}
        selectionType="multi"
        selectedItems={selectedRecords}
        onSelectionChange={({ detail }) =>
          setSelectedRecords([...detail.selectedItems])
        }
        trackBy="id"
        resizableColumns
        variant="full-page"
        stickyHeader
        visibleColumns={preferences.visibleContent}
        columnDefinitions={[
          {
            id: "name",
            header: "Record name",
            cell: (item) => item.name,
            sortingField: "name",
            minWidth: 180,
          },
          {
            id: "type",
            header: "Type",
            cell: (item) => item.type,
            minWidth: 80,
          },
          {
            id: "routing",
            header: "Routing policy",
            cell: () => "Simple",
            minWidth: 120,
          },
          {
            id: "diff",
            header: "Differentiator",
            cell: () => "—",
            minWidth: 100,
          },
          {
            id: "alias",
            header: "Alias",
            cell: (item) => recordAlias(item),
            minWidth: 80,
          },
          {
            id: "value",
            header: "Value/Route traffic to",
            cell: (item) => (
              <Box fontSize="body-s">
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {item.value.includes("\n") || item.type === "NS"
                    ? item.value
                    : item.value.length > 80
                      ? `${item.value.slice(0, 80)}…`
                      : item.value}
                </div>
              </Box>
            ),
            minWidth: 260,
          },
          {
            id: "ttl",
            header: "TTL (seconds)",
            cell: (item) => item.ttl,
            minWidth: 110,
          },
          {
            id: "health",
            header: "Health Check ID",
            cell: () => "—",
            minWidth: 120,
          },
        ]}
        items={filteredItems}
        filter={
          <SpaceBetween direction="horizontal" size="xs">
            <div style={{ minWidth: 280, flex: 1 }}>
              <TextFilter
                filteringText={filterText}
                onChange={({ detail }) => setFilterText(detail.filteringText)}
                filteringPlaceholder="Filter records by property or value"
                countText={`${recordResponse?.total ?? 0} matches`}
              />
            </div>
            <Select
              selectedOption={
                typeFilter
                  ? { label: typeFilter, value: typeFilter }
                  : { label: "Type", value: "" }
              }
              onChange={({ detail }) =>
                setTypeFilter(detail.selectedOption.value || null)
              }
              options={[{ label: "All types", value: "" }, ...RECORD_TYPES]}
              placeholder="Type"
            />
            <Select
              selectedOption={
                ROUTING_FILTER.find((o) => o.value === routingFilter) ||
                ROUTING_FILTER[0]
              }
              onChange={({ detail }) =>
                setRoutingFilter(detail.selectedOption.value || "")
              }
              options={ROUTING_FILTER}
              placeholder="Routing policy"
            />
            <Select
              selectedOption={
                ALIAS_FILTER.find((o) => o.value === aliasFilter) || ALIAS_FILTER[0]
              }
              onChange={({ detail }) =>
                setAliasFilter(detail.selectedOption.value || "")
              }
              options={ALIAS_FILTER}
              placeholder="Alias"
            />
          </SpaceBetween>
        }
        pagination={
          <Pagination
            currentPageIndex={page}
            pagesCount={totalPages}
            onChange={({ detail }) => setPage(detail.currentPageIndex)}
          />
        }
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={preferences}
            visibleContentPreference={{
              title: "Select visible columns",
              options: [
                {
                  label: "Record properties",
                  options: [
                    { id: "name", label: "Record name" },
                    { id: "type", label: "Type" },
                    { id: "routing", label: "Routing policy" },
                    { id: "diff", label: "Differentiator" },
                    { id: "alias", label: "Alias" },
                    { id: "value", label: "Value/Route traffic to" },
                    { id: "ttl", label: "TTL (seconds)" },
                    { id: "health", label: "Health Check ID" },
                  ],
                },
              ],
            }}
            onConfirm={({ detail }) =>
              setPreferences({
                pageSize: detail.pageSize ?? 50,
                visibleContent: detail.visibleContent as string[],
              })
            }
          />
        }
      />
    </SpaceBetween>
  );

  return (
    <>
      <SpaceBetween size="l">
        <BreadcrumbGroup
          items={[
            { text: "Route 53", href: "/dashboard" },
            { text: "Hosted zones", href: "/hosted-zones" },
            { text: hostedZone.name, href: "#" },
          ]}
          onFollow={(e) => {
            e.preventDefault();
            if (e.detail.href !== "#") router.push(e.detail.href);
          }}
        />

        <Header
          variant="h1"
          info={<Link href="#">Info</Link>}
          description={
            <Badge color={hostedZone.type === "Private" ? "blue" : "blue"}>
              {hostedZone.type}
            </Badge>
          }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => setDeleteZoneOpen(true)}>Delete zone</Button>
              <Button
                onClick={() => {
                  setTestName(hostedZone.name);
                  setTestType(RECORD_TYPES[0]);
                  setTestResult(null);
                  setTestOpen(true);
                }}
              >
                Test record
              </Button>
              <Button onClick={() => setQueryLogOpen(true)}>
                Configure query logging
              </Button>
            </SpaceBetween>
          }
        >
          {hostedZone.name}
        </Header>

        <ExpandableSection
          headerText="Hosted zone details"
          variant="container"
          defaultExpanded
          headerActions={
            <Button
              onClick={() => {
                setEditZoneName(hostedZone.name);
                setEditZoneDescription(hostedZone.description || "");
                setEditZoneOpen(true);
              }}
            >
              Edit hosted zone
            </Button>
          }
        >
          <ColumnLayout columns={3} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Hosted zone name</Box>
              <div>{hostedZone.name}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Type</Box>
              <div>
                {hostedZone.type === "Private"
                  ? "Private hosted zone"
                  : "Public hosted zone"}
              </div>
            </div>
            <div>
              <Box variant="awsui-key-label">Hosted zone ID</Box>
              <div>/hostedzone/{hostedZone.id}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Record count</Box>
              <div>{hostedZone.recordCount}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Description</Box>
              <div>{hostedZone.description || "—"}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Query log</Box>
              <div>—</div>
            </div>
            {hostedZone.type === "Private" && (
              <>
                <div>
                  <Box variant="awsui-key-label">VPC ID</Box>
                  <div>{hostedZone.vpcId || "—"}</div>
                </div>
                <div>
                  <Box variant="awsui-key-label">Region</Box>
                  <div>{hostedZone.vpcRegion || "—"}</div>
                </div>
              </>
            )}
            <div>
              <Box variant="awsui-key-label">Name servers</Box>
              <Box fontSize="body-s">
                {nsValues.length
                  ? nsValues.map((ns) => <div key={ns}>{ns}</div>)
                  : "—"}
              </Box>
            </div>
          </ColumnLayout>
        </ExpandableSection>

        <Tabs
          tabs={[
            {
              id: "records",
              label: `Records (${recordResponse?.total ?? 0})`,
              content: recordsTab,
            },
            {
              id: "dnssec",
              label: "DNSSEC signing",
              content: (
                <Container>
                  <Alert type="info">
                    DNSSEC signing is mocked for this assignment.
                  </Alert>
                </Container>
              ),
            },
            {
              id: "tags",
              label: "Hosted zone tags (0)",
              content: (
                <Container>
                  <Alert type="info">Tags are mocked for this assignment.</Alert>
                </Container>
              ),
            },
          ]}
        />

        <Modal
          visible={deleteOpen}
          onDismiss={() => setDeleteOpen(false)}
          header="Delete records"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleBulkDelete}>
                  Delete
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          Delete {selectedRecords.length} selected record(s)? SOA records are protected.
        </Modal>

        <Modal
          visible={importOpen}
          onDismiss={() => setImportOpen(false)}
          header="Import zone file"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setImportOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleImport}>
                  Import
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <FormField
            label="BIND zone file contents"
            description="Paste a BIND-format zone file to import DNS records."
          >
            <Textarea
              value={importContent}
              onChange={({ detail }) => setImportContent(detail.value)}
              rows={12}
              placeholder={'$ORIGIN example.com.\n$TTL 300\nwww IN A 192.0.2.1'}
            />
          </FormField>
        </Modal>

        <Modal
          visible={deleteZoneOpen}
          onDismiss={() => setDeleteZoneOpen(false)}
          header="Delete hosted zone"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setDeleteZoneOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={deleteZoneMutation.isPending}
                  onClick={handleDeleteZone}
                >
                  Delete zone
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          Delete hosted zone <b>{hostedZone.name}</b>? This cannot be undone.
        </Modal>

        <Modal
          visible={editZoneOpen}
          onDismiss={() => setEditZoneOpen(false)}
          header="Edit hosted zone"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setEditZoneOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={updateZoneMutation.isPending}
                  onClick={handleEditZone}
                  disabled={!editZoneName.trim()}
                >
                  Save changes
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="m">
            <FormField label="Domain name">
              <Input
                value={editZoneName}
                onChange={({ detail }) => setEditZoneName(detail.value)}
              />
            </FormField>
            <FormField label="Description">
              <Textarea
                value={editZoneDescription}
                onChange={({ detail }) => setEditZoneDescription(detail.value)}
                rows={3}
              />
            </FormField>
          </SpaceBetween>
        </Modal>

        <Modal
          visible={testOpen}
          onDismiss={() => setTestOpen(false)}
          header="Test record"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setTestOpen(false)}>
                  Close
                </Button>
                <Button variant="primary" onClick={runTestRecord}>
                  Get record
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="m">
            <FormField label="Record name">
              <Input
                value={testName}
                onChange={({ detail }) => setTestName(detail.value)}
                placeholder={hostedZone.name}
              />
            </FormField>
            <FormField label="Record type">
              <Select
                selectedOption={testType}
                onChange={({ detail }) =>
                  setTestType(detail.selectedOption as typeof testType)
                }
                options={RECORD_TYPES}
              />
            </FormField>
            {testResult && (
              <Alert type="info" header="Resolution result (mock)">
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{testResult}</pre>
              </Alert>
            )}
          </SpaceBetween>
        </Modal>

        <Modal
          visible={queryLogOpen}
          onDismiss={() => setQueryLogOpen(false)}
          header="Configure query logging"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setQueryLogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setQueryLogEnabled(true);
                    setQueryLogOpen(false);
                    toast.success(
                      queryLogEnabled
                        ? "Query logging settings updated"
                        : "Query logging enabled (mocked)"
                    );
                  }}
                >
                  Save
                </Button>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="m">
            <Alert type="info">
              Query logging is mocked for this assignment. Enabling it stores a
              local preference only — no CloudWatch log group is created.
            </Alert>
            <Toggle
              checked={queryLogEnabled}
              onChange={({ detail }) => setQueryLogEnabled(detail.checked)}
            >
              Enable query logging
            </Toggle>
          </SpaceBetween>
        </Modal>
      </SpaceBetween>

      <Drawer
        open={editOpen}
        position="fixed"
        placement="end"
        backdrop
        closeAction={{ ariaLabel: "Close" }}
        onClose={() => {
          setEditOpen(false);
          setEditingRecord(null);
        }}
        header={<h2 style={{ margin: 0 }}>Edit record</h2>}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => {
                  setEditOpen(false);
                  setEditingRecord(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={updateMutation.isPending}
                onClick={handleEdit}
              >
                Save
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="l">
          <FormField
            label="Record name"
            info={<Link href="#">Info</Link>}
            description="Keep blank to create a record for the root domain."
          >
            <Input
              value={recordName}
              onChange={({ detail }) => setRecordName(detail.value)}
            />
          </FormField>
          <FormField label="Record type" info={<Link href="#">Info</Link>}>
            <Select
              selectedOption={recordType}
              onChange={({ detail }) =>
                setRecordType(detail.selectedOption as typeof recordType)
              }
              options={RECORD_TYPES}
            />
          </FormField>
          <FormField label="Alias">
            <Toggle
              checked={alias}
              onChange={({ detail }) => setAlias(detail.checked)}
            >
              Alias
            </Toggle>
          </FormField>
          <FormField
            label="Value"
            info={<Link href="#">Info</Link>}
            description="Enter multiple values on separate lines."
          >
            <Textarea
              value={recordValue}
              onChange={({ detail }) => setRecordValue(detail.value)}
              rows={4}
            />
          </FormField>
          <FormField
            label="TTL (seconds)"
            info={<Link href="#">Info</Link>}
            description="Recommended values: 60 to 172800 (two days)"
          >
            <SpaceBetween size="xs">
              <Input
                value={recordTtl}
                onChange={({ detail }) => setRecordTtl(detail.value)}
                disabled={alias}
              />
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setRecordTtl("60")} disabled={alias}>
                  1m
                </Button>
                <Button onClick={() => setRecordTtl("3600")} disabled={alias}>
                  1h
                </Button>
                <Button onClick={() => setRecordTtl("86400")} disabled={alias}>
                  1d
                </Button>
              </SpaceBetween>
            </SpaceBetween>
          </FormField>
          <FormField label="Routing policy" info={<Link href="#">Info</Link>}>
            <Select
              selectedOption={{ label: "Simple routing", value: "simple" }}
              options={[{ label: "Simple routing", value: "simple" }]}
              onChange={() => undefined}
            />
          </FormField>
        </SpaceBetween>
      </Drawer>
    </>
  );
}
