interface RecordTypeBadgeProps {
  type: string;
}

const COLORS: Record<string, string> = {
  A: "bg-blue-100 text-blue-700",
  AAAA: "bg-indigo-100 text-indigo-700",
  CNAME: "bg-green-100 text-green-700",
  MX: "bg-orange-100 text-orange-700",
  TXT: "bg-purple-100 text-purple-700",
  NS: "bg-cyan-100 text-cyan-700",
  PTR: "bg-pink-100 text-pink-700",
  SOA: "bg-yellow-100 text-yellow-700",
  SRV: "bg-emerald-100 text-emerald-700",
  CAA: "bg-red-100 text-red-700",
};

export function RecordTypeBadge({
  type,
}: RecordTypeBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-none px-2 py-1 text-xs font-semibold ${
        COLORS[type] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {type}
    </span>
  );
}