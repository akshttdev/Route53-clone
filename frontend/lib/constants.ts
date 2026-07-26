export const ROUTES = {
  LOGIN: "/login",

  DASHBOARD: "/",

  HOSTED_ZONES: "/hosted-zones",

  SETTINGS: "/settings",
};

export const DEFAULT_PAGE_SIZE = 10;

export const DNS_RECORD_TYPES = [
  "A",
  "AAAA",
  "CAA",
  "CNAME",
  "DS",
  "MX",
  "NAPTR",
  "NS",
  "PTR",
  "SOA",
  "SPF",
  "SRV",
  "TXT",
] as const;

export const DEFAULT_TTL = 300;