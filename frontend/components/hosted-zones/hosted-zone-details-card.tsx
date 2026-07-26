import { Globe, Lock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { HostedZone } from "@/types/hosted-zone";

interface HostedZoneDetailsCardProps {
  hostedZone: HostedZone;
}

export function HostedZoneDetailsCard({
  hostedZone,
}: HostedZoneDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hosted Zone Details</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Domain Name
            </p>

            <p className="mt-2 text-lg font-semibold">
              {hostedZone.name}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Type
            </p>

            <div className="mt-2 flex items-center gap-2">
              {hostedZone.type === "Public" ? (
                <Globe className="h-5 w-5 text-blue-500" />
              ) : (
                <Lock className="h-5 w-5 text-orange-500" />
              )}

              <span className="font-medium">
                {hostedZone.type}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Description
            </p>

            <p className="mt-2">
              {hostedZone.description || "No description"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Record Count
            </p>

            <p className="mt-2 text-lg font-semibold">
              {hostedZone.recordCount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}