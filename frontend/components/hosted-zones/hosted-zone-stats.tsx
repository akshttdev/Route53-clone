import {
  Database,
  Globe,
  ShieldCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { HostedZone } from "@/types/hosted-zone";

interface Props {
  hostedZone: HostedZone;
}

export function HostedZoneStats({
  hostedZone,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <p className="text-sm text-muted-foreground">
              DNS Records
            </p>

            <p className="text-3xl font-bold">
              {hostedZone.recordCount}
            </p>
          </div>

          <Database className="h-8 w-8 text-blue-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Zone Type
            </p>

            <p className="text-2xl font-semibold">
              {hostedZone.type}
            </p>
          </div>

          <Globe className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <p className="text-2xl font-semibold">
              Active
            </p>
          </div>

          <ShieldCheck className="h-8 w-8 text-emerald-500" />
        </CardContent>
      </Card>
    </div>
  );
}