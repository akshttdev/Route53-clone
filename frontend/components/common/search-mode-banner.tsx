"use client";

import { useEffect, useState } from "react";

import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Modal from "@cloudscape-design/components/modal";
import RadioGroup from "@cloudscape-design/components/radio-group";
import SpaceBetween from "@cloudscape-design/components/space-between";

import {
  getStoredSearchMode,
  setStoredSearchMode,
  type SearchMode,
} from "@/lib/search-mode";

type SearchModeBannerProps = {
  /** When true, render as Header description (no wrapper Box). */
  asDescription?: boolean;
};

export default function SearchModeBanner({
  asDescription = false,
}: SearchModeBannerProps) {
  const [mode, setMode] = useState<SearchMode>("automatic");
  const [draft, setDraft] = useState<SearchMode>("automatic");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredSearchMode();
    setMode(stored);
    setDraft(stored);
  }, []);

  const openSettings = () => {
    setDraft(mode);
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    setMode(draft);
    setStoredSearchMode(draft);
    setSettingsOpen(false);
  };

  const modeLabel = mode === "automatic" ? "Automatic" : "Manual";
  const modeBlurb =
    mode === "automatic"
      ? "optimized for best filter results"
      : "lets you type free-text queries without property suggestions";

  const copy = (
    <>
      {modeLabel} mode is the current search behavior {modeBlurb}. To change
      modes{" "}
      <button type="button" className="aws-text-link" onClick={openSettings}>
        go to settings
      </button>
      .
    </>
  );

  return (
    <>
      {asDescription ? (
        copy
      ) : (
        <Box color="text-body-secondary" fontSize="body-s">
          {copy}
        </Box>
      )}

      <Modal
        visible={settingsOpen}
        onDismiss={() => setSettingsOpen(false)}
        header="Search settings"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveSettings}>
                Confirm
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="p">
            Choose how table filters behave across Hosted zones and Records.
            Your preference is saved in this browser.
          </Box>
          <RadioGroup
            value={draft}
            onChange={({ detail }) => setDraft(detail.value as SearchMode)}
            items={[
              {
                value: "automatic",
                label: "Automatic",
                description:
                  "Property-aware filtering optimized for best filter results (default).",
              },
              {
                value: "manual",
                label: "Manual",
                description:
                  "Free-text filtering without automatic property suggestions.",
              },
            ]}
          />
        </SpaceBetween>
      </Modal>
    </>
  );
}
