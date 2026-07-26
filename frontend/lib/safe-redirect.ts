/**
 * Only allow relative internal paths — blocks open redirects (//evil.com, https://…).
 */
export function safeInternalPath(
  path: string | null | undefined,
  fallback = "/hosted-zones"
): string {
  if (!path || typeof path !== "string") return fallback;

  const trimmed = path.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return fallback;
  }

  return trimmed;
}
