"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCollection } from "@cloudscape-design/collection-hooks";

import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Link from "@cloudscape-design/components/link";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import Modal from "@cloudscape-design/components/modal";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Textarea from "@cloudscape-design/components/textarea";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import ColumnLayout from "@cloudscape-design/components/column-layout";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";

import { useHostedZones } from "@/hooks/use-hosted-zones";
import { useDeleteHostedZone } from "@/hooks/use-delete-hosted-zone";
import { useUpdateHostedZone } from "@/hooks/use-update-hosted-zone";
import { HostedZone } from "@/types/hosted-zone";
import { useSplitPanel } from "@/components/layout/split-panel-context";
import SearchModeBanner from "@/components/common/search-mode-banner";

export default function HostedZonesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const { setSplitPanel, closeSplitPanel } = useSplitPanel();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [filterText, setFilterText] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [selectedZones, setSelectedZones] = useState<HostedZone[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [preferences, setPreferences] = useState({
    pageSize: 20,
    visibleContent: [
      "name",
      "type",
      "createdBy",
      "recordCount",
      "description",
      "id",
    ],
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(filterText.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [filterText]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setFilterText(q);
    setDebouncedQ(q);
  }, [searchParams]);

  const { data, isLoading, refetch, isFetching } = useHostedZones({
    page,
    page_size: pageSize,
    q: debouncedQ || undefined,
  });
  const deleteMutation = useDeleteHostedZone();
  const updateMutation = useUpdateHostedZone();

  const items = data?.items ?? [];
  const totalPages = Math.max(1, data ? Math.ceil(data.total / data.page_size) : 1);

  const { items: filteredItems, collectionProps } = useCollection(items, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="xxl">
          <Box variant="strong" fontSize="heading-s">
            No hosted zones
          </Box>
          <Box variant="p" color="inherit" padding={{ bottom: "s" }}>
            There are no hosted zones created for this account.
          </Box>
          <Button
            variant="primary"
            onClick={() => router.push("/hosted-zones/create")}
          >
            Create hosted zone
          </Button>
        </Box>
      ),
      noMatch: (
        <Box textAlign="center" color="inherit">
          <b>No matches</b>
          <Box variant="p" color="inherit">
            We can&apos;t find a match.
          </Box>
        </Box>
      ),
    },
    selection: {},
  });

  useEffect(() => {
    const openCreate = () => router.push("/hosted-zones/create");
    window.addEventListener("trigger-create-hosted-zone", openCreate);
    return () => window.removeEventListener("trigger-create-hosted-zone", openCreate);
  }, [router]);

  useEffect(() => {
    const selected = selectedZones[0];
    if (!selected) {
      setSplitPanel({
        open: true,
        header: "0 hosted zone selected",
        content: (
          <Box color="text-body-secondary" padding="m">
            Select a hosted zone to see its details
          </Box>
        ),
      });
      return;
    }

    setSplitPanel({
      open: true,
      header: "1 hosted zone selected",
      content: (
        <SpaceBetween size="l">
          <ColumnLayout columns={1} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Hosted zone name</Box>
              <Link
                href={`/hosted-zones/${selected.id}`}
                onFollow={(e) => {
                  e.preventDefault();
                  router.push(`/hosted-zones/${selected.id}`);
                }}
              >
                {selected.name}
              </Link>
            </div>
            <div>
              <Box variant="awsui-key-label">Type</Box>
              <div>{selected.type}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Record count</Box>
              <div>{selected.recordCount}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Description</Box>
              <div>{selected.description || "—"}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Hosted zone ID</Box>
              <div>/hostedzone/{selected.id}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Created by</Box>
              <div>Route 53</div>
            </div>
          </ColumnLayout>
          <Button onClick={() => router.push(`/hosted-zones/${selected.id}`)}>
            View details
          </Button>
        </SpaceBetween>
      ),
    });
  }, [selectedZones, setSplitPanel, router]);

  useEffect(() => {
    return () => closeSplitPanel();
  }, [closeSplitPanel]);

  const openEdit = (zone: HostedZone) => {
    setEditName(zone.name);
    setEditDescription(zone.description || "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    const zone = selectedZones[0];
    if (!zone) return;
    try {
      await updateMutation.mutateAsync({
        id: String(zone.id),
        data: {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        },
      });
      toast.success("Hosted zone updated");
      setEditOpen(false);
      refetch();
    } catch {
      toast.error("Failed to update hosted zone");
    }
  };

  const handleDelete = async () => {
    try {
      for (const zone of selectedZones) {
        await deleteMutation.mutateAsync(String(zone.id));
      }
      toast.success(`Deleted ${selectedZones.length} hosted zone(s)`);
      setSelectedZones([]);
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete hosted zone(s)");
    }
  };

  const hasSelection = selectedZones.length > 0;
  const single = selectedZones.length === 1 ? selectedZones[0] : null;

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: "Route 53", href: "/dashboard" },
          { text: "Hosted zones", href: "#" },
        ]}
        onFollow={(e) => {
          e.preventDefault();
          if (e.detail.href !== "#") router.push(e.detail.href);
        }}
      />

      <Header
        variant="h1"
        counter={`(${data?.total ?? 0})`}
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
              onClick={() => refetch()}
              loading={isFetching}
            />
            <Button
              disabled={!single}
              onClick={() => single && router.push(`/hosted-zones/${single.id}`)}
            >
              View details
            </Button>
            <Button disabled={!single} onClick={() => single && openEdit(single)}>
              Edit
            </Button>
            <Button disabled={!hasSelection} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push("/hosted-zones/create")}
            >
              Create hosted zone
            </Button>
          </SpaceBetween>
        }
      >
        Hosted zones
      </Header>

      <SearchModeBanner />

      <Table
        {...collectionProps}
        loading={isLoading}
        loadingText="Loading hosted zones"
        selectionType="single"
        selectedItems={selectedZones}
        onSelectionChange={({ detail }) =>
          setSelectedZones([...detail.selectedItems])
        }
        trackBy="id"
        resizableColumns
        variant="full-page"
        stickyHeader
        visibleColumns={preferences.visibleContent}
        columnDefinitions={[
          {
            id: "name",
            header: "Hosted zone name",
            cell: (item) => (
              <Link
                href={`/hosted-zones/${item.id}`}
                onFollow={(e) => {
                  e.preventDefault();
                  router.push(`/hosted-zones/${item.id}`);
                }}
              >
                {item.name}
              </Link>
            ),
            sortingField: "name",
            minWidth: 200,
          },
          {
            id: "type",
            header: "Type",
            cell: (item) => item.type,
            minWidth: 100,
          },
          {
            id: "createdBy",
            header: "Created by",
            cell: () => "Route 53",
            minWidth: 120,
          },
          {
            id: "recordCount",
            header: "Record count",
            cell: (item) => item.recordCount,
            minWidth: 120,
          },
          {
            id: "description",
            header: "Description",
            cell: (item) => item.description || "—",
            minWidth: 180,
          },
          {
            id: "id",
            header: "Hosted zone ID",
            cell: (item) => `/hostedzone/${item.id}`,
            minWidth: 160,
          },
        ]}
        items={filteredItems}
        filter={
          <TextFilter
            filteringText={filterText}
            onChange={({ detail }) => setFilterText(detail.filteringText)}
            filteringPlaceholder="Filter hosted zones by property or value"
            filteringAriaLabel="Filter hosted zones"
            countText={`${data?.total ?? 0} matches`}
          />
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
            pageSizePreference={{
              title: "Page size",
              options: [
                { value: 10, label: "10 hosted zones" },
                { value: 20, label: "20 hosted zones" },
                { value: 50, label: "50 hosted zones" },
              ],
            }}
            visibleContentPreference={{
              title: "Select visible columns",
              options: [
                {
                  label: "Hosted zone properties",
                  options: [
                    { id: "name", label: "Hosted zone name" },
                    { id: "type", label: "Type" },
                    { id: "createdBy", label: "Created by" },
                    { id: "recordCount", label: "Record count" },
                    { id: "description", label: "Description" },
                    { id: "id", label: "Hosted zone ID" },
                  ],
                },
              ],
            }}
            onConfirm={({ detail }) =>
              setPreferences({
                pageSize: detail.pageSize ?? 20,
                visibleContent: detail.visibleContent as string[],
              })
            }
          />
        }
        empty={
          <Box textAlign="center" color="inherit" padding="xxl">
            <Box variant="strong" fontSize="heading-s">
              No hosted zones
            </Box>
            <Box variant="p" color="inherit" padding={{ bottom: "s" }}>
              {debouncedQ
                ? `No hosted zones match “${debouncedQ}".`
                : "There are no hosted zones created for this account."}
            </Box>
            <Button
              variant="primary"
              onClick={() => router.push("/hosted-zones/create")}
            >
              Create hosted zone
            </Button>
          </Box>
        }
      />

      <Modal
        visible={editOpen}
        onDismiss={() => setEditOpen(false)}
        header="Edit hosted zone"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={updateMutation.isPending}
                onClick={handleEdit}
                disabled={!editName.trim()}
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
              value={editName}
              onChange={({ detail }) => setEditName(detail.value)}
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={editDescription}
              onChange={({ detail }) => setEditDescription(detail.value)}
              rows={3}
            />
          </FormField>
        </SpaceBetween>
      </Modal>

      <Modal
        visible={deleteOpen}
        onDismiss={() => setDeleteOpen(false)}
        header="Delete hosted zones"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        Delete {selectedZones.length} hosted zone(s)? This cannot be undone.
      </Modal>
    </SpaceBetween>
  );
}
