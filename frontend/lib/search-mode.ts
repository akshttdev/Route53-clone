export type SearchMode = "automatic" | "manual";

export const SEARCH_MODE_STORAGE_KEY = "route53-search-mode";

export function getStoredSearchMode(): SearchMode {
  if (typeof window === "undefined") return "automatic";
  const stored = localStorage.getItem(SEARCH_MODE_STORAGE_KEY);
  return stored === "manual" ? "manual" : "automatic";
}

export function setStoredSearchMode(mode: SearchMode): void {
  localStorage.setItem(SEARCH_MODE_STORAGE_KEY, mode);
}
