import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DNSRecordService } from "@/services/dns-record.service";

import { dnsRecordKeys } from "./use-dns-records";

interface Variables {
  hostedZoneId: string;
  recordId: string;
}

export function useDeleteDNSRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hostedZoneId,
      recordId,
    }: Variables) =>
      DNSRecordService.deleteRecord(
        hostedZoneId,
        recordId
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