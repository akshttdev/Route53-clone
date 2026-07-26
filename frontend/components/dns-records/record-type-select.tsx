"use client";

import { DNSRecordType } from "@/types/dns-record";

interface Props {
  value: DNSRecordType;
  onChange: (value: DNSRecordType) => void;
}

const TYPES: DNSRecordType[] = [
  "A",
  "AAAA",
  "CAA",
  "CNAME",
  "MX",
  "NS",
  "PTR",
  "SOA",
  "SRV",
  "TXT",
];

export function RecordTypeSelect({
  value,
  onChange,
}: Props) {
  return (
    <select
      className="h-10 w-full rounded-lg border px-3"
      value={value}
      onChange={(e) =>
        onChange(e.target.value as DNSRecordType)
      }
    >
      {TYPES.map((type) => (
        <option
          key={type}
          value={type}
        >
          {type}
        </option>
      ))}
    </select>
  );
}