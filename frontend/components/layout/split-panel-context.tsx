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
  size: 400,
};

const SplitPanelContext = createContext<SplitPanelContextValue | null>(null);

export function SplitPanelProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SplitPanelState>(defaultState);

  const setSplitPanel = useCallback((next: Partial<SplitPanelState> | null) => {
    if (next === null) {
      setState(defaultState);
      return;
    }
    setState((prev) => ({ ...prev, ...next, open: next.open ?? true }));
  }, []);

  const closeSplitPanel = useCallback(() => {
    setState(defaultState);
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
