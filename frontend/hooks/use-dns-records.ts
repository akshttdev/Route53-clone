import { useQuery } from "@tanstack/react-query";

import {
  DNSRecordQueryParams,
  DNSRecordService,
} from "@/services/dns-record.service";

export const dnsRecordKeys = {
  all: ["dns-records"] as const,

  list: (
    hostedZoneId: string,
    params?: DNSRecordQueryParams
  ) =>
    [
      ...dnsRecordKeys.all,
      hostedZoneId,
      params,
    ] as const,

  detail: (
    hostedZoneId: string,
    recordId: string
  ) =>
    [
      ...dnsRecordKeys.all,
      hostedZoneId,
      recordId,
    ] as const,
};

interface UseDNSRecordsOptions {
  enabled?: boolean;
}

export function useDNSRecords(
  hostedZoneId: string,
  params?: DNSRecordQueryParams,
  options?: UseDNSRecordsOptions
) {
  return useQuery({
    queryKey: dnsRecordKeys.list(hostedZoneId, params),
    queryFn: () =>
      DNSRecordService.getRecords(hostedZoneId, params),
    enabled:
      Boolean(hostedZoneId) &&
      (options?.enabled ?? true),
  });
}

export function useDNSRecord(
  hostedZoneId: string,
  recordId: string,
  options?: UseDNSRecordsOptions
) {
  return useQuery({
    queryKey: dnsRecordKeys.detail(
      hostedZoneId,
      recordId
    ),
    queryFn: () =>
      DNSRecordService.getRecord(
        hostedZoneId,
        recordId
      ),
    enabled:
      Boolean(hostedZoneId) &&
      Boolean(recordId) &&
      (options?.enabled ?? true),
  });
}