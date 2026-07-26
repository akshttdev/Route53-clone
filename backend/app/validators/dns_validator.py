import re
from ipaddress import (
    IPv4Address,
    IPv6Address,
)

from app.schemas.dns_record import DNSRecordBase
from app.utils.dns import normalize_dns_name

HOSTNAME_REGEX = re.compile(
    r"^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$",
    re.IGNORECASE,
)

CAA_REGEX = re.compile(
    r'^(0|[1-9]\d*)\s+(issue|issuewild|iodef)\s+".+"$',
    re.IGNORECASE,
)

PTR_REGEX = re.compile(
    r"^(.+\.)?(in-addr\.arpa|ip6\.arpa)$",
    re.IGNORECASE,
)


class DNSValidationError(ValueError):
    pass


class DNSValidator:
    @staticmethod
    def validate(record: DNSRecordBase) -> None:
        validators = {
            "A": DNSValidator.validate_a,
            "AAAA": DNSValidator.validate_aaaa,
            "CNAME": DNSValidator.validate_cname,
            "MX": DNSValidator.validate_mx,
            "TXT": DNSValidator.validate_txt,
            "NS": DNSValidator.validate_ns,
            "SOA": DNSValidator.validate_soa,
            "SRV": DNSValidator.validate_srv,
            "PTR": DNSValidator.validate_ptr,
            "CAA": DNSValidator.validate_caa,
        }

        validator = validators.get(record.type.value)

        if validator is None:
            raise DNSValidationError("Unsupported DNS record type.")

        validator(record.value)

    @staticmethod
    def validate_hostname(hostname: str) -> None:
        hostname = normalize_dns_name(hostname)

        if hostname == "@":
            return

        if not HOSTNAME_REGEX.fullmatch(hostname):
            raise DNSValidationError("Invalid hostname.")

    @staticmethod
    def validate_a(value: str) -> None:
        try:
            IPv4Address(value)
        except ValueError:
            raise DNSValidationError("Invalid IPv4 address.")

    @staticmethod
    def validate_aaaa(value: str) -> None:
        try:
            IPv6Address(value)
        except ValueError:
            raise DNSValidationError("Invalid IPv6 address.")

    @staticmethod
    def validate_cname(value: str) -> None:
        DNSValidator.validate_hostname(value)

    @staticmethod
    def validate_ns(value: str) -> None:
        DNSValidator.validate_hostname(value)

    @staticmethod
    def validate_txt(value: str) -> None:
        if len(value.encode("utf-8")) > 255:
            raise DNSValidationError("TXT record exceeds 255 bytes.")

    @staticmethod
    def validate_mx(value: str) -> None:
        parts = value.split()

        if len(parts) != 2:
            raise DNSValidationError("MX record must be '<priority> <hostname>'.")

        priority, hostname = parts

        try:
            priority = int(priority)
        except ValueError:
            raise DNSValidationError("MX priority must be an integer.")

        if not (0 <= priority <= 65535):
            raise DNSValidationError("MX priority must be between 0 and 65535.")

        DNSValidator.validate_hostname(hostname)

    @staticmethod
    def validate_srv(value: str) -> None:
        parts = value.split()

        if len(parts) != 4:
            raise DNSValidationError(
                "SRV record must be '<priority> <weight> <port> <target>'."
            )

        priority, weight, port, target = parts

        try:
            priority = int(priority)
            weight = int(weight)
            port = int(port)
        except ValueError:
            raise DNSValidationError("Priority, weight and port must be integers.")

        if not (0 <= priority <= 65535):
            raise DNSValidationError("Invalid priority.")

        if not (0 <= weight <= 65535):
            raise DNSValidationError("Invalid weight.")

        if not (0 <= port <= 65535):
            raise DNSValidationError("Invalid port.")

        DNSValidator.validate_hostname(target)

    @staticmethod
    def validate_soa(value: str) -> None:
        parts = value.split()

        if len(parts) != 7:
            raise DNSValidationError("SOA record must contain 7 fields.")

        primary_ns = parts[0]
        hostmaster = parts[1]

        DNSValidator.validate_hostname(primary_ns)
        DNSValidator.validate_hostname(hostmaster)

        for field in parts[2:]:
            try:
                number = int(field)
            except ValueError:
                raise DNSValidationError("SOA numeric fields must be integers.")

            if number < 0:
                raise DNSValidationError("SOA numeric fields must be non-negative.")

    @staticmethod
    def validate_ptr(value: str) -> None:
        DNSValidator.validate_hostname(value)

    @staticmethod
    def validate_caa(value: str) -> None:
        if not CAA_REGEX.fullmatch(value.strip()):
            raise DNSValidationError("CAA record must be '<flags> <tag> \"value\"'.")
