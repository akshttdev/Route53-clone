"""BIND zone file and JSON export/import helpers."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass

from app.models.dns_record import DNSRecord
from app.models.hosted_zone import HostedZone

RECORD_LINE = re.compile(
    r"^(?P<name>\S+)\s+(?:(?P<ttl>\d+)\s+)?(?:IN\s+)?(?P<type>A|AAAA|CNAME|MX|TXT|NS|SOA|SRV|PTR|CAA)\s+(?P<value>.+)$",
    re.IGNORECASE,
)


@dataclass
class ParsedRecord:
    name: str
    type: str
    value: str
    ttl: int


def export_zone_json(zone: HostedZone, records: list[DNSRecord]) -> str:
    payload = {
        "hostedZone": {
            "id": zone.id,
            "name": zone.name,
            "description": zone.description,
            "type": "Public",
        },
        "resourceRecordSets": [
            {
                "Name": record.name,
                "Type": record.type,
                "TTL": record.ttl,
                "ResourceRecords": [{"Value": record.value}],
            }
            for record in records
        ],
    }
    return json.dumps(payload, indent=2)


def export_zone_bind(zone: HostedZone, records: list[DNSRecord]) -> str:
    lines = [
        f"; Zone file for {zone.name}",
        f"; Exported from Route53 Clone",
        "$ORIGIN " + zone.name.rstrip(".") + ".",
        "$TTL 300",
        "",
    ]

    sorted_records = sorted(records, key=lambda r: (r.name, r.type, r.value))

    for record in sorted_records:
        name = _bind_name(record.name, zone.name)
        value = record.value
        if record.type in {"TXT"} and not value.startswith('"'):
            value = f'"{value}"'
        lines.append(f"{name}\t{record.ttl}\tIN\t{record.type}\t{value}")

    lines.append("")
    return "\n".join(lines)


def parse_bind_zone(content: str, zone_name: str, default_ttl: int = 300) -> list[ParsedRecord]:
    origin = zone_name.rstrip(".").lower() + "."
    ttl = default_ttl
    records: list[ParsedRecord] = []

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith(";") or line.startswith("//"):
            continue

        if line.upper().startswith("$ORIGIN"):
            parts = line.split()
            if len(parts) >= 2:
                origin = parts[1].lower()
                if not origin.endswith("."):
                    origin += "."
            continue

        if line.upper().startswith("$TTL"):
            parts = line.split()
            if len(parts) >= 2 and parts[1].isdigit():
                ttl = int(parts[1])
            continue

        # Strip inline comments
        if ";" in line:
            line = line.split(";", 1)[0].strip()

        match = RECORD_LINE.match(line)
        if not match:
            continue

        name = match.group("name")
        record_ttl = int(match.group("ttl")) if match.group("ttl") else ttl
        record_type = match.group("type").upper()
        value = match.group("value").strip()

        if value.startswith('"') and value.endswith('"'):
            value = value[1:-1]

        fqdn = _to_absolute_name(name, origin, zone_name)

        records.append(
            ParsedRecord(
                name=fqdn,
                type=record_type,
                value=value,
                ttl=record_ttl,
            )
        )

    return records


def _bind_name(record_name: str, zone_name: str) -> str:
    zone = zone_name.rstrip(".").lower()
    name = record_name.rstrip(".").lower()

    if name == zone:
        return "@"
    if name.endswith("." + zone):
        return name[: -(len(zone) + 1)]
    return name


def _to_absolute_name(name: str, origin: str, zone_name: str) -> str:
    zone = zone_name.rstrip(".").lower()

    if name == "@":
        return zone

    if name.endswith("."):
        return name.rstrip(".").lower()

    origin_base = origin.rstrip(".").lower()
    return f"{name.lower()}.{origin_base}"
