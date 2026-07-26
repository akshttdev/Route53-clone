"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import Modal from "@cloudscape-design/components/modal";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter, usePathname } from "next/navigation";

const KeyboardShortcutsContext = createContext<{
  openModal: () => void;
}>({
  openModal: () => {},
});

export function useKeyboardShortcuts() {
  return useContext(KeyboardShortcutsContext);
}

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      const isInput =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        document.activeElement?.hasAttribute("contenteditable");

      if ((e.key === "?" || (e.shiftKey && e.key === "/")) && !isInput) {
        e.preventDefault();
        setModalVisible(true);
      }

      if (e.key === "Escape") {
        setModalVisible(false);
      }

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="Filter"]'
        ) as HTMLInputElement | null;
        searchInput?.focus();
      }

      if (e.key === "c" && !isInput && pathname === "/hosted-zones") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("trigger-create-hosted-zone"));
      }

      if (e.key === "g" && !isInput) {
        const handleNextKey = (nextEvent: KeyboardEvent) => {
          if (nextEvent.key === "h") {
            router.push("/hosted-zones");
          } else if (nextEvent.key === "d") {
            router.push("/dashboard");
          }
          window.removeEventListener("keydown", handleNextKey);
        };
        window.addEventListener("keydown", handleNextKey);
        window.setTimeout(() => {
          window.removeEventListener("keydown", handleNextKey);
        }, 1000);
      }
    };

    const handleOpenModal = () => setModalVisible(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-shortcuts-modal", handleOpenModal);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-shortcuts-modal", handleOpenModal);
    };
  }, [mounted, router, pathname]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{ openModal: () => setModalVisible(true) }}
    >
      {children}
      {mounted ? (
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          header="Keyboard shortcuts"
          size="medium"
        >
          <SpaceBetween size="m">
            <div>
              <Box variant="h3">Navigation</Box>
              <table style={{ width: "100%", marginTop: "8px" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 0" }}>
                      <code>g</code> then <code>h</code>
                    </td>
                    <td style={{ padding: "4px 0" }}>Go to Hosted zones</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>
                      <code>g</code> then <code>d</code>
                    </td>
                    <td style={{ padding: "4px 0" }}>Go to Dashboard</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <Box variant="h3">Actions</Box>
              <table style={{ width: "100%", marginTop: "8px" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 0" }}>
                      <code>c</code>
                    </td>
                    <td style={{ padding: "4px 0" }}>
                      Create hosted zone (on list page)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>
                      <code>/</code>
                    </td>
                    <td style={{ padding: "4px 0" }}>
                      Focus search/filter input
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>
                      <code>?</code>
                    </td>
                    <td style={{ padding: "4px 0" }}>Show this help</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>
                      <code>Escape</code>
                    </td>
                    <td style={{ padding: "4px 0" }}>Close modals</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SpaceBetween>
        </Modal>
      ) : null}
    </KeyboardShortcutsContext.Provider>
  );
}
