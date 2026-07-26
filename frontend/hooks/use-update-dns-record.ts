import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  DNSRecordService,
  UpdateDNSRecordRequest,
} from "@/services/dns-record.service";

import { dnsRecordKeys } from "./use-dns-records";

interface Variables {
  hostedZoneId: string;
  recordId: string;
  data: UpdateDNSRecordRequest;
}

export function useUpdateDNSRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hostedZoneId,
      recordId,
      data,
    }: Variables) =>
      DNSRecordService.updateRecord(
        hostedZoneId,
        recordId,
        data
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: dnsRecordKeys.list(
          variables.hostedZoneId
        ),
      });
    },
  });
}