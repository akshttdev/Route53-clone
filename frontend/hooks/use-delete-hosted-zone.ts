import { useMutation, useQueryClient } from "@tanstack/react-query";

import { hostedZoneService } from "@/services/hosted-zone.service";

import { hostedZoneKeys } from "./use-hosted-zones";

export function useDeleteHostedZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      hostedZoneService.deleteHostedZone(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hostedZoneKeys.all,
      });
    },
  });
}