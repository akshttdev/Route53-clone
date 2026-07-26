def normalize_dns_name(name: str) -> str:
    """
    Normalize a DNS name for consistent storage and comparison.

    Examples:
        Example.COM.     -> example.com
        example.com.     -> example.com
        @                -> @
        WWW.Example.Com. -> www.example.com
    """

    name = name.strip()

    if name == "@":
        return "@"

    return name.rstrip(".").lower()


def to_fqdn(
    record_name: str,
    zone_name: str,
) -> str:
    """
    Convert a record name into a Fully Qualified Domain Name (FQDN).

    Examples:
        Zone: example.com

        @           -> example.com
        www         -> www.example.com
        mail        -> mail.example.com
        *.api       -> *.api.example.com
        example.com -> example.com
    """

    record_name = normalize_dns_name(record_name)
    zone_name = normalize_dns_name(zone_name)

    if record_name == "@":
        return zone_name

    if record_name.endswith(zone_name):
        return record_name

    return f"{record_name}.{zone_name}"
