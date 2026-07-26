"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SplitPanelState {
  open: boolean;
  header: string;
  content: React.ReactNode;
  size?: number;
}

interface SplitPanelContextValue {
  state: SplitPanelState;
  setSplitPanel: (next: Partial<SplitPanelState> | null) => void;
  closeSplitPanel: () => void;
}

const defaultState: SplitPanelState = {
  open: false,
  header: "",
  content: null,
  size: 340,
};

const SplitPanelContext = createContext<SplitPanelContextValue | null>(null);

function sameSplitPanelState(
  prev: SplitPanelState,
  next: SplitPanelState
): boolean {
  return (
    prev.open === next.open &&
    prev.header === next.header &&
    prev.content === next.content &&
    prev.size === next.size
  );
}

export function SplitPanelProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SplitPanelState>(defaultState);

  const setSplitPanel = useCallback((next: Partial<SplitPanelState> | null) => {
    if (next === null) {
      setState((prev) =>
        sameSplitPanelState(prev, defaultState) ? prev : defaultState
      );
      return;
    }
    setState((prev) => {
      const merged: SplitPanelState = {
        ...prev,
        ...next,
        open: next.open ?? true,
      };
      return sameSplitPanelState(prev, merged) ? prev : merged;
    });
  }, []);

  const closeSplitPanel = useCallback(() => {
    setState((prev) =>
      sameSplitPanelState(prev, defaultState) ? prev : defaultState
    );
  }, []);

  const value = useMemo(
    () => ({ state, setSplitPanel, closeSplitPanel }),
    [state, setSplitPanel, closeSplitPanel]
  );

  return (
    <SplitPanelContext.Provider value={value}>
      {children}
    </SplitPanelContext.Provider>
  );
}

export function useSplitPanel() {
  const ctx = useContext(SplitPanelContext);
  if (!ctx) {
    throw new Error("useSplitPanel must be used within SplitPanelProvider");
  }
  return ctx;
}
