"use client";

import Header from "@cloudscape-design/components/header";
import Table from "@cloudscape-design/components/table";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Alert from "@cloudscape-design/components/alert";
import TextFilter from "@cloudscape-design/components/text-filter";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  createLabel?: string;
  columns?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function Route53PlaceholderPage({
  title,
  description = "This feature is mocked for the Route 53 clone assignment.",
  createLabel,
  columns = ["Name", "Status", "Description"],
  emptyTitle,
  emptyDescription = "This section will be available in a future update.",
}: PlaceholderPageProps) {
  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        counter="(0)"
        description={description}
        actions={
          createLabel ? (
            <Button variant="primary" disabled>
              {createLabel}
            </Button>
          ) : undefined
        }
      >
        {title}
      </Header>

      <Alert type="info">Coming soon — mocked Route 53 section for this assignment.</Alert>

      <Table
        columnDefinitions={columns.map((header, index) => ({
          id: `col-${index}`,
          header,
          cell: () => "—",
        }))}
        items={[]}
        loadingText="Loading"
        filter={
          <TextFilter
            filteringText=""
            filteringPlaceholder="Filter by property or value"
            onChange={() => undefined}
          />
        }
        empty={
          <Box textAlign="center" color="inherit" padding="xxl">
            <Box variant="strong" fontSize="heading-s">
              {emptyTitle ?? `No ${title.toLowerCase()}`}
            </Box>
            <Box variant="p" color="inherit" padding={{ bottom: "s" }}>
              {emptyDescription}
            </Box>
            {createLabel ? (
              <Button variant="primary" disabled>
                {createLabel}
              </Button>
            ) : null}
          </Box>
        }
      />
    </SpaceBetween>
  );
}
