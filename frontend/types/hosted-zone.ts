export interface HostedZone {
  id: string | number
  name: string
  type: "Public" | "Private"
  recordCount: number
  description?: string
  ownerId?: number
  vpcId?: string | null
  vpcRegion?: string | null
  createdAt?: string
  updatedAt?: string
}
