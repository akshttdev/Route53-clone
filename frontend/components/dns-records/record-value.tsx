import { DNSRecord } from "@/types/dns-record";

interface Props {
  record: DNSRecord;
}

export function RecordValue({
  record,
}: Props) {
  switch (record.type) {
    case "MX":
      return (
        <span>
          {record.priority} {record.value}
        </span>
      );

    case "SRV":
      return (
        <span>
          {record.weight}:{record.port} {record.value}
        </span>
      );

    default:
      return (
        <span className="font-mono">
          {record.value}
        </span>
      );
  }
}