"use client";

import { DNSRecordType } from "@/types/dns-record";

interface Props {
  value: DNSRecordType | "ALL";
  onChange: (value: DNSRecordType | "ALL") => void;
}

const TYPES: (DNSRecordType | "ALL")[] = [
  "ALL",
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

export function RecordFilter({
  value,
  onChange,
}: Props) {
  return (
    <select
      className="h-10 rounded-none border border-[#687078] px-3"
      value={value}
      onChange={(e) =>
        onChange(e.target.value as DNSRecordType | "ALL")
      }
    >
      {TYPES.map((type) => (
        <option
          key={type}
          value={type}
        >
          {type === "ALL"
            ? "All Types"
            : type}
        </option>
      ))}
    </select>
  );
}