'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { type ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import TabsDemo from './Tabs';

import { cn } from '@/lib/utils';
import MethodSelector from './MethodSelector';
import UrlInput from './UrlInput';

const VERTICAL_COLLAPSED_SIZE = 6;
const VERTICAL_OPEN_LAYOUT: number[] = [50, 50];
const VERTICAL_COLLAPSED_LAYOUT: number[] = [
  VERTICAL_COLLAPSED_SIZE,
  100 - VERTICAL_COLLAPSED_SIZE,
];

export function RequestResponseArea() {
  const [isRequestPanelCollapsed, setIsRequestPanelCollapsed] = useState(true);
  const verticalLayoutGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const expandRequestPanel = useCallback(() => {
    const panelGroup = verticalLayoutGroupRef.current;
    if (panelGroup && isRequestPanelCollapsed) {
      panelGroup.setLayout(VERTICAL_OPEN_LAYOUT);
    }
  }, [isRequestPanelCollapsed]);

  const toggleRequestPanel = () => {
    const panelGroup = verticalLayoutGroupRef.current;
    if (panelGroup) {
      if (isRequestPanelCollapsed) {
        panelGroup.setLayout(VERTICAL_OPEN_LAYOUT);
      } else {
        panelGroup.setLayout(VERTICAL_COLLAPSED_LAYOUT);
      }
    }
  };

  const syncRequestPanelState = (isCollapsed: boolean) => {
    if (isCollapsed !== isRequestPanelCollapsed) {
      setIsRequestPanelCollapsed(isCollapsed);
    }
  };

  return (
    <ResizablePanelGroup
      ref={verticalLayoutGroupRef}
      direction="vertical"
      className="h-full rounded-lg flex m-6"
    >
      <div className="flex w-4xl max-w-[85vw] mx-auto mt-5 justify-center">
        <MethodSelector />
        <UrlInput />
      </div>
      <ResizablePanel
        id="request-panel"
        order={1}
        defaultSize={
          isRequestPanelCollapsed
            ? VERTICAL_COLLAPSED_LAYOUT[0]
            : VERTICAL_OPEN_LAYOUT[0]
        }
        collapsible={true}
        collapsedSize={VERTICAL_COLLAPSED_SIZE}
        minSize={VERTICAL_COLLAPSED_SIZE}
        onCollapse={() => syncRequestPanelState(true)}
        onExpand={() => syncRequestPanelState(false)}
        className="transition-all duration-300 ease-in-out border-2 border-blue-500 w-[70%] rounded-md mt-10 mx-auto"
      >
        <div className="relative h-full w-full">
          <Button
            onClick={toggleRequestPanel}
            variant="ghost"
            size="icon"
            aria-label="Toggle Request Panel"
            className="absolute top-1 right-2 z-10 border bg-background hover:bg-muted h-5 w-5 p-0"
          >
            {isRequestPanelCollapsed ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>

          <div
            className={cn(
              'h-full overflow-auto',
              isRequestPanelCollapsed && 'overflow-hidden'
            )}
          >
            <TabsDemo onTabChange={expandRequestPanel} />
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        id="response-panel"
        className="mx-auto"
        order={2}
        defaultSize={
          isRequestPanelCollapsed
            ? VERTICAL_COLLAPSED_LAYOUT[1]
            : VERTICAL_OPEN_LAYOUT[1]
        }
        minSize={20}
      >
        <div className="p-4 h-full overflow-auto border-2 border-red-500">
          <p>Response</p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
