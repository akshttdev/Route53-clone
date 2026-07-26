import { api } from "@/lib/api"
import { DNSRecord } from "@/types/dns-record"

export interface DNSRecordListResponse {
  items: DNSRecord[]
  total: number
  page: number
  page_size: number
}

export interface DNSRecordQueryParams {
  page?: number
  page_size?: number
  search?: string
  q?: string
  type?: string
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export interface CreateDNSRecordRequest {
  name: string
  type: DNSRecord["type"]
  value: string
  ttl: number
  priority?: number
  weight?: number
  port?: number
}

export interface UpdateDNSRecordRequest {
  name?: string
  type?: DNSRecord["type"]
  value?: string
  ttl?: number
  priority?: number
  weight?: number
  port?: number
}

interface APIDNSRecordResponse {
  id: number
  hosted_zone_id: number
  type: DNSRecord["type"]
  name: string
  value: string
  ttl: number
  created_at: string
  updated_at: string
}

interface APIRecordListResponse {
  items: APIDNSRecordResponse[]
  total: number
  page: number
  page_size: number
}

function mapDNSRecord(apiRecord: APIDNSRecordResponse): DNSRecord {
  return {
    id: apiRecord.id,
    hostedZoneId: apiRecord.hosted_zone_id,
    name: apiRecord.name,
    type: apiRecord.type,
    value: apiRecord.value,
    ttl: apiRecord.ttl,
    createdAt: apiRecord.created_at,
    updatedAt: apiRecord.updated_at,
  }
}

export const DNSRecordService = {
  async getRecords(
    hostedZoneId: string | number,
    params?: DNSRecordQueryParams
  ): Promise<DNSRecordListResponse> {
    const { data } = await api.get<APIRecordListResponse>(
      `/hosted-zones/${hostedZoneId}/records`,
      { params }
    )

    return {
      items: data.items.map(mapDNSRecord),
      total: data.total,
      page: data.page,
      page_size: data.page_size,
    }
  },

  async getRecord(
    hostedZoneId: string | number,
    recordId: string | number
  ): Promise<DNSRecord> {
    const { data } = await api.get<APIDNSRecordResponse>(
      `/hosted-zones/${hostedZoneId}/records/${recordId}`
    )

    return mapDNSRecord(data)
  },

  async createRecord(
    hostedZoneId: string | number,
    payload: CreateDNSRecordRequest
  ): Promise<DNSRecord> {
    const { data } = await api.post<APIDNSRecordResponse>(
      `/hosted-zones/${hostedZoneId}/records`,
      payload
    )

    return mapDNSRecord(data)
  },

  async updateRecord(
    hostedZoneId: string | number,
    recordId: string | number,
    payload: UpdateDNSRecordRequest
  ): Promise<DNSRecord> {
    const { data } = await api.patch<APIDNSRecordResponse>(
      `/hosted-zones/${hostedZoneId}/records/${recordId}`,
      payload
    )

    return mapDNSRecord(data)
  },

  async deleteRecord(
    hostedZoneId: string | number,
    recordId: string | number
  ): Promise<void> {
    await api.delete(
      `/hosted-zones/${hostedZoneId}/records/${recordId}`
    )
  },

  async bulkDeleteRecords(
    hostedZoneId: string | number,
    recordIds: number[]
  ): Promise<void> {
    await api.post(
      `/hosted-zones/${hostedZoneId}/records/bulk-delete`,
      { record_ids: recordIds }
    )
  },

  async exportZone(
    hostedZoneId: string | number,
    format: "json" | "bind"
  ): Promise<Blob> {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${api.defaults.baseURL}/hosted-zones/${hostedZoneId}/export?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export zone");
    }

    return await response.blob();
  },

  async importZone(
    hostedZoneId: string | number,
    content: string,
    replaceExisting: boolean = false
  ): Promise<void> {
    await api.post(
      `/hosted-zones/${hostedZoneId}/import`,
      {
        content,
        replace_existing: replaceExisting,
      }
    )
  },
}