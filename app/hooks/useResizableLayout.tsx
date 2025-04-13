'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { type ImperativePanelGroupHandle } from 'react-resizable-panels';

const HORIZONTAL_OPEN_LAYOUT: number[] = [70, 30];
const HORIZONTAL_CLOSED_LAYOUT: number[] = [100, 0];
const STORAGE_KEY = 'codePanelOpenState';
interface UseResizableLayoutReturn {
  isPanelOpen: boolean;
  layoutGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
  togglePanel: () => void;
  syncPanelState: (isOpen: boolean) => void;
  OPEN_LAYOUT: number[];
  CLOSED_LAYOUT: number[];
}
export function useResizableLayout(
  initialOpen = false
): UseResizableLayoutReturn {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedValue = sessionStorage.getItem(STORAGE_KEY);
        if (storedValue !== null) {
          return JSON.parse(storedValue);
        }
      } catch {}
    }
    return initialOpen;
  });

  const layoutGroupRef = useRef<ImperativePanelGroupHandle>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(isPanelOpen));
      } catch {}
    }
  }, [isPanelOpen]);

  const togglePanel = useCallback(() => {
    const shouldBeOpen = !isPanelOpen;
    setIsPanelOpen(shouldBeOpen);
    const panelGroup = layoutGroupRef.current;
    if (panelGroup) {
      panelGroup.setLayout(
        shouldBeOpen ? HORIZONTAL_OPEN_LAYOUT : HORIZONTAL_CLOSED_LAYOUT
      );
    }
  }, [isPanelOpen]);

  const syncPanelState = useCallback((isOpen: boolean) => {
    setIsPanelOpen((prevIsOpen) => {
      if (prevIsOpen !== isOpen) {
        return isOpen;
      }
      return prevIsOpen;
    });
  }, []);

  return {
    isPanelOpen,
    layoutGroupRef,
    togglePanel,
    syncPanelState,
    OPEN_LAYOUT: HORIZONTAL_OPEN_LAYOUT,
    CLOSED_LAYOUT: HORIZONTAL_CLOSED_LAYOUT,
  };
}
