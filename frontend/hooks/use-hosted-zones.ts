import { useQuery } from "@tanstack/react-query";

import {
  hostedZoneService,
  hostedZoneQueryParams,
} from "@/services/hosted-zone.service";

export const hostedZoneKeys = {
  all: ["hosted-zones"] as const,

  lists: () => [...hostedZoneKeys.all, "list"] as const,

  list: (params?: hostedZoneQueryParams) =>
    [...hostedZoneKeys.lists(), params] as const,

  details: () => [...hostedZoneKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...hostedZoneKeys.details(), id] as const,
};

export function useHostedZones(
  params?: hostedZoneQueryParams
) {
  return useQuery({
    queryKey: hostedZoneKeys.list(params),
    queryFn: () => hostedZoneService.getHostedZones(params),
  });
}

export function useHostedZone(id: string) {
  return useQuery({
    queryKey: hostedZoneKeys.detail(id),
    queryFn: () => hostedZoneService.getHostedZone(id),
    enabled: !!id,
  });
}