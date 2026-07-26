import { api } from "@/lib/api"
import { HostedZone } from "@/types/hosted-zone"

export interface hostedZoneListResponse {
  items: HostedZone[]
  total: number
  page: number
  page_size: number
}

export interface createHostedZoneRequest {
  name: string
  description?: string
  type?: "Public" | "Private"
  vpc_id?: string
  vpc_region?: string
}

export interface updateHostedZoneRequest {
  name?: string
  description?: string
}

export interface hostedZoneQueryParams {
  page?: number
  page_size?: number
  search?: string
  q?: string
}

interface APIHostedZoneResponse {
  id: number
  name: string
  description?: string
  owner_id: number
  record_count: number
  type: "Public" | "Private"
  vpc_id?: string | null
  vpc_region?: string | null
  created_at: string
  updated_at: string
}

interface APIListResponse {
  items: APIHostedZoneResponse[]
  total: number
  page: number
  page_size: number
}

function mapHostedZone(apiZone: APIHostedZoneResponse): HostedZone {
  return {
    id: apiZone.id,
    name: apiZone.name,
    type: apiZone.type,
    recordCount: apiZone.record_count,
    description: apiZone.description,
    ownerId: apiZone.owner_id,
    vpcId: apiZone.vpc_id,
    vpcRegion: apiZone.vpc_region,
    createdAt: apiZone.created_at,
    updatedAt: apiZone.updated_at,
  }
}

export const hostedZoneService = {
  async getHostedZones(
    params?: hostedZoneQueryParams
  ): Promise<hostedZoneListResponse> {
    const { data } = await api.get<APIListResponse>("/hosted-zones", { params })
    return {
      items: data.items.map(mapHostedZone),
      total: data.total,
      page: data.page,
      page_size: data.page_size,
    }
  },

  async getHostedZone(id: string | number): Promise<HostedZone> {
    const { data } = await api.get<APIHostedZoneResponse>(`/hosted-zones/${id}`)
    return mapHostedZone(data)
  },

  async createHostedZone(
    payload: createHostedZoneRequest
  ): Promise<HostedZone> {
    const { data } = await api.post<APIHostedZoneResponse>(
      "/hosted-zones",
      payload
    )
    return mapHostedZone(data)
  },

  async updateHostedZone(
    id: string | number,
    payload: updateHostedZoneRequest
  ): Promise<HostedZone> {
    const { data } = await api.patch<APIHostedZoneResponse>(
      `/hosted-zones/${id}`,
      payload
    )
    return mapHostedZone(data)
  },

  async deleteHostedZone(id: string | number): Promise<void> {
    await api.delete(`/hosted-zones/${id}`)
  },
}
