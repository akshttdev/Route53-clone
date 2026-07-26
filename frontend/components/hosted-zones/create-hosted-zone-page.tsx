"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import Header from "@cloudscape-design/components/header";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Container from "@cloudscape-design/components/container";
import SpaceBetween from "@cloudscape-design/components/space-between";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Textarea from "@cloudscape-design/components/textarea";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import Tiles from "@cloudscape-design/components/tiles";
import Select from "@cloudscape-design/components/select";
import Alert from "@cloudscape-design/components/alert";
import Link from "@cloudscape-design/components/link";
import ColumnLayout from "@cloudscape-design/components/column-layout";

import { useCreateHostedZone } from "@/hooks/use-create-hosted-zone";

const REGIONS = [
  { label: "US East (N. Virginia)", value: "us-east-1" },
  { label: "US West (Oregon)", value: "us-west-2" },
  { label: "EU (Ireland)", value: "eu-west-1" },
  { label: "Asia Pacific (Mumbai)", value: "ap-south-1" },
];

const MOCK_VPCS = [
  { label: "Main-VPC (vpc-01abb347d38537699)", value: "vpc-01abb347d38537699", tag: "Main-VPC" },
  { label: "Dev-VPC (vpc-0a1b2c3d4e5f67890)", value: "vpc-0a1b2c3d4e5f67890", tag: "Dev-VPC" },
  { label: "Prod-VPC (vpc-0987654321abcdef0)", value: "vpc-0987654321abcdef0", tag: "Prod-VPC" },
];

export default function CreateHostedZonePage() {
  const router = useRouter();
  const createMutation = useCreateHostedZone();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState("public");
  const [region, setRegion] = useState(REGIONS[0]);
  const [vpcId, setVpcId] = useState(MOCK_VPCS[0].value);
  const [vpcs, setVpcs] = useState([{ id: 1 }]);

  const selectedVpc = useMemo(
    () => MOCK_VPCS.find((v) => v.value === vpcId) ?? MOCK_VPCS[0],
    [vpcId]
  );

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Domain name is required");
      return;
    }

    try {
      const zone = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type: zoneType === "private" ? "Private" : "Public",
        vpc_id: zoneType === "private" ? vpcId : undefined,
        vpc_region: zoneType === "private" ? region.value : undefined,
      });
      toast.success("Hosted zone created");
      router.push(`/hosted-zones/${zone.id}`);
    } catch {
      toast.error("Failed to create hosted zone");
    }
  };

  return (
    <SpaceBetween size="l">
      <BreadcrumbGroup
        items={[
          { text: "Route 53", href: "/dashboard" },
          { text: "Hosted zones", href: "/hosted-zones" },
          { text: "Create hosted zone", href: "#" },
        ]}
        onFollow={(e) => {
          e.preventDefault();
          if (e.detail.href !== "#") router.push(e.detail.href);
        }}
      />

      <Header variant="h1">Create hosted zone</Header>

      <Container
        header={
          <Header variant="h2" description="Provide the domain name and configuration for your hosted zone.">
            Hosted zone configuration
          </Header>
        }
      >
        <SpaceBetween size="l">
          <FormField
            label="Domain name"
            info={<Link external href="#">Info</Link>}
            description="This is the name of the domain that you want to route traffic for. Valid characters: a-z, 0-9, - (hyphen)."
          >
            <Input
              value={name}
              onChange={({ detail }) => setName(detail.value)}
              placeholder="example.com"
            />
          </FormField>

          <FormField
            label="Description - optional"
            info={<Link external href="#">Info</Link>}
            description={`The description can have up to 256 characters. ${description.length}/256`}
          >
            <Textarea
              value={description}
              onChange={({ detail }) => setDescription(detail.value.slice(0, 256))}
              rows={3}
            />
          </FormField>

          <FormField label="Type" info={<Link external href="#">Info</Link>}>
            <Tiles
              value={zoneType}
              onChange={({ detail }) => setZoneType(detail.value)}
              items={[
                {
                  value: "public",
                  label: "Public hosted zone",
                  description:
                    "Create a hosted zone that determines how traffic is routed on the internet.",
                },
                {
                  value: "private",
                  label: "Private hosted zone",
                  description:
                    "Create a hosted zone that determines how traffic is routed within an Amazon VPC.",
                },
              ]}
            />
          </FormField>
        </SpaceBetween>
      </Container>

      {zoneType === "private" && (
        <Container
          header={
            <Header
              variant="h2"
              description="Choose the VPCs that you want to associate with this hosted zone."
              info={<Link external href="#">Info</Link>}
            >
              VPCs to associate with the hosted zone
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Alert type="info" dismissible>
              To ensure that DNS resolution works for your VPC, enable DNS hostnames and DNS
              resolution in the VPC settings.{" "}
              <Link href="#">Learn more</Link>
            </Alert>

            {vpcs.map((row) => (
              <ColumnLayout key={row.id} columns={3} variant="text-grid">
                <FormField label="Region" info={<Link external href="#">Info</Link>}>
                  <Select
                    selectedOption={region}
                    onChange={({ detail }) =>
                      setRegion(detail.selectedOption as typeof region)
                    }
                    options={REGIONS}
                  />
                </FormField>

                <FormField
                  label={
                    <SpaceBetween direction="horizontal" size="xs">
                      <span>VPC ID</span>
                      <Box color="text-status-info" fontSize="body-s">
                        {selectedVpc.tag}
                      </Box>
                    </SpaceBetween>
                  }
                  info={<Link external href="#">Info</Link>}
                >
                  <Input
                    value={vpcId}
                    onChange={({ detail }) => setVpcId(detail.value)}
                    type="search"
                    placeholder="vpc-xxxxxxxx"
                  />
                </FormField>

                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <Button
                    onClick={() =>
                      setVpcs((prev) => prev.filter((p) => p.id !== row.id))
                    }
                    disabled={vpcs.length === 1}
                  >
                    Remove VPC
                  </Button>
                </div>
              </ColumnLayout>
            ))}

            <Button
              onClick={() =>
                setVpcs((prev) => [...prev, { id: Date.now() }])
              }
            >
              Add VPC
            </Button>
          </SpaceBetween>
        </Container>
      )}

      <Box float="right">
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={() => router.push("/hosted-zones")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={createMutation.isPending}
            onClick={handleCreate}
          >
            Create hosted zone
          </Button>
        </SpaceBetween>
      </Box>
    </SpaceBetween>
  );
}
