import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  DNSRecordService,
  CreateDNSRecordRequest,
} from "@/services/dns-record.service";

import { dnsRecordKeys } from "./use-dns-records";

interface Variables {
  hostedZoneId: string;
  data: CreateDNSRecordRequest;
}

export function useCreateDNSRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hostedZoneId, data }: Variables) =>
      DNSRecordService.createRecord(hostedZoneId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: dnsRecordKeys.list(
          variables.hostedZoneId
        ),
      });
    },
  });
}