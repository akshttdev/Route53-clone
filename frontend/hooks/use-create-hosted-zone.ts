import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  hostedZoneService,
  createHostedZoneRequest,
} from "@/services/hosted-zone.service";

import { hostedZoneKeys } from "./use-hosted-zones";

export function useCreateHostedZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: createHostedZoneRequest) =>
      hostedZoneService.createHostedZone(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hostedZoneKeys.all,
      });
    },
  });
}