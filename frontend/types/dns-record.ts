export type DNSRecordType =
  | "A"
  | "AAAA"
  | "CAA"
  | "CNAME"
  | "DS"
  | "MX"
  | "NAPTR"
  | "NS"
  | "PTR"
  | "SOA"
  | "SPF"
  | "SRV"
  | "TXT";

export interface DNSRecord {
  id: string | number
  hostedZoneId?: number
  name: string
  type: DNSRecordType
  value: string
  ttl: number
  priority?: number
  weight?: number
  port?: number
  healthCheckId?: string
  routingPolicy?: string
  createdAt?: string
  updatedAt?: string
}