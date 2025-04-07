'use client';

import { useState, useRef, useCallback } from 'react';
import { type ImperativePanelGroupHandle } from 'react-resizable-panels';

const HORIZONTAL_OPEN_LAYOUT: number[] = [70, 30];
const HORIZONTAL_CLOSED_LAYOUT: number[] = [100, 0];
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
  const [isPanelOpen, setIsPanelOpen] = useState(initialOpen);

  const layoutGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const togglePanel = useCallback(() => {
    const panelGroup = layoutGroupRef.current;
    if (panelGroup) {
      if (isPanelOpen) {
        panelGroup.setLayout(HORIZONTAL_CLOSED_LAYOUT);
      } else {
        panelGroup.setLayout(HORIZONTAL_OPEN_LAYOUT);
      }
    }
  }, [isPanelOpen]);

  const syncPanelState = useCallback((isOpen: boolean) => {
    setIsPanelOpen((prev) => {
      if (isOpen !== prev) {
        return isOpen;
      }
      return prev;
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
