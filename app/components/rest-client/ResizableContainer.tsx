'use client';

import React, { useState, useRef } from 'react';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { type ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import TabsDemo from './Tabs';

const OPEN_LAYOUT: number[] = [70, 30];
const CLOSED_LAYOUT: number[] = [100, 0];

export default function ResizableContainer() {
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
  const layoutGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const toggleCodePanel = () => {
    const panelGroup = layoutGroupRef.current;
    if (panelGroup) {
      if (isCodePanelOpen) {
        panelGroup.setLayout(CLOSED_LAYOUT);
      } else {
        panelGroup.setLayout(OPEN_LAYOUT);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <Button
        onClick={toggleCodePanel}
        variant="ghost"
        size="icon"
        aria-label="Toggle Code Panel"
        className="absolute top-1 right-2 z-10 border bg-background hover:bg-muted"
      >
        {isCodePanelOpen ? (
          <PanelRightClose className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      <ResizablePanelGroup
        ref={layoutGroupRef}
        direction="horizontal"
        className="h-full w-full rounded-lg"
      >
        <ResizablePanel
          defaultSize={isCodePanelOpen ? OPEN_LAYOUT[0] : CLOSED_LAYOUT[0]}
          minSize={30}
        >
          <ResizablePanelGroup
            direction="vertical"
            className="h-full flex gap-2 mx-auto items-center"
          >
            <ResizablePanel
              defaultSize={50}
              minSize={10}
              className="border-2 border-blue-500 w-[70%] rounded-md"
            >
              <div className="p-4 h-full overflow-auto">
                <TabsDemo />
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel
              defaultSize={50}
              minSize={20}
              className="border-2 border-red-500 w-[90%] rounded-md"
            >
              <div className="p-4 h-full overflow-auto">
                <p>Response</p>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          id="code-panel"
          order={2}
          defaultSize={isCodePanelOpen ? OPEN_LAYOUT[1] : CLOSED_LAYOUT[1]}
          collapsible={true}
          collapsedSize={0}
          minSize={15}
          onCollapse={() => {
            if (isCodePanelOpen) setIsCodePanelOpen(false);
          }}
          onExpand={() => {
            if (!isCodePanelOpen) setIsCodePanelOpen(true);
          }}
          className="transition-all duration-300 ease-in-out border-2 border-red-500"
        >
          {isCodePanelOpen && (
            <div className="p-4 h-full overflow-auto">
              <p>Code Snippet</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
