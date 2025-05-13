import { useState, useRef, useCallback } from 'react';
import { type ImperativePanelGroupHandle } from 'react-resizable-panels';

const VERTICAL_COLLAPSED_SIZE = 2;
const VERTICAL_OPEN_LAYOUT: number[] = [40, 60];
const VERTICAL_COLLAPSED_LAYOUT: number[] = [
  VERTICAL_COLLAPSED_SIZE,
  100 - VERTICAL_COLLAPSED_SIZE,
];

export interface UseCollapsiblePanelReturn {
  isCollapsed: boolean;
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
  togglePanel: () => void;
  openPanel: () => void;
  syncPanelState: (isCollapsed: boolean) => void;
  OPEN_LAYOUT: number[];
  COLLAPSED_LAYOUT: number[];
  COLLAPSED_SIZE: number;
}

export default function useCollapsiblePanel(
  initialCollapsed = false
): UseCollapsiblePanelReturn {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const setLayout = useCallback((layout: number[]) => {
    panelGroupRef.current?.setLayout(layout);
  }, []);

  const openPanel = useCallback(() => {
    setIsCollapsed(false);
    setLayout(VERTICAL_OPEN_LAYOUT);
  }, [setLayout]);

  const closePanel = useCallback(() => {
    setIsCollapsed(true);
    setLayout(VERTICAL_COLLAPSED_LAYOUT);
  }, [setLayout]);

  const togglePanel = useCallback(() => {
    if (isCollapsed) {
      openPanel();
    } else {
      closePanel();
    }
  }, [isCollapsed, openPanel, closePanel]);

  const syncPanelState = useCallback((shouldBeCollapsed: boolean) => {
    setIsCollapsed((prevIsCollapsed) => {
      if (prevIsCollapsed !== shouldBeCollapsed) {
        return shouldBeCollapsed;
      }
      return prevIsCollapsed;
    });
  }, []);
  return {
    isCollapsed,
    panelGroupRef,
    togglePanel,
    openPanel,
    syncPanelState,
    OPEN_LAYOUT: VERTICAL_OPEN_LAYOUT,
    COLLAPSED_LAYOUT: VERTICAL_COLLAPSED_LAYOUT,
    COLLAPSED_SIZE: VERTICAL_COLLAPSED_SIZE,
  };
}
