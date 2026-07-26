import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  hostedZoneService,
  updateHostedZoneRequest,
} from "@/services/hosted-zone.service";

import { hostedZoneKeys } from "./use-hosted-zones";

interface Variables {
  id: string;
  data: updateHostedZoneRequest;
}

export function useUpdateHostedZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: Variables) =>
      hostedZoneService.updateHostedZone(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hostedZoneKeys.all,
      });
    },
  });
}