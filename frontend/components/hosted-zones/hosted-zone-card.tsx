import {
  Globe,
  Lock,
} from "lucide-react";

import { HostedZone } from "@/types/hosted-zone";

import { Card } from "@/components/ui/card";

interface Props {
  zone: HostedZone;
  onClick?: () => void;
}

export function HostedZoneCard({
  zone,
  onClick,
}: Props) {
  return (
    <Card
      className="cursor-pointer transition hover:shadow-lg"
      onClick={onClick}
    >
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {zone.name}
          </h3>

          {zone.type === "Public" ? (
            <Globe className="h-5 w-5 text-green-500" />
          ) : (
            <Lock className="h-5 w-5 text-orange-500" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {zone.description || "No description"}
        </p>

        <div className="flex justify-between text-sm">
          <span>{zone.type}</span>

          <span>
            {zone.recordCount} Records
          </span>
        </div>
      </div>
    </Card>
  );
}