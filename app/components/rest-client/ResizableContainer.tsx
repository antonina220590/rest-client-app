'use client';

import React from 'react';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';

import { useResizableLayout } from '@/app/hooks/useResizableLayout';
import { RequestResponseArea } from './RequestResponseArea';

export default function ResizableContainer() {
  const {
    isPanelOpen,
    layoutGroupRef,
    togglePanel,
    syncPanelState,
    OPEN_LAYOUT,
    CLOSED_LAYOUT,
  } = useResizableLayout(false);

  return (
    <div className="relative w-full h-full">
      <Button
        onClick={togglePanel}
        variant="ghost"
        size="icon"
        aria-label="Toggle Code Panel"
        className="absolute top-2 right-2 z-10 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isPanelOpen ? (
          <PanelRightClose className="h-6 w-6 " />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      <ResizablePanelGroup
        ref={layoutGroupRef}
        direction="horizontal"
        className="h-full w-full border rounded-lg"
      >
        <ResizablePanel
          id="main-content-panel"
          order={1}
          defaultSize={isPanelOpen ? OPEN_LAYOUT[0] : CLOSED_LAYOUT[0]}
          minSize={30}
          className="flex"
        >
          <RequestResponseArea />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          id="code-panel"
          order={2}
          defaultSize={isPanelOpen ? OPEN_LAYOUT[1] : CLOSED_LAYOUT[1]}
          collapsible={true}
          collapsedSize={0}
          minSize={15}
          onCollapse={() => syncPanelState(false)}
          onExpand={() => syncPanelState(true)}
          className="transition-all duration-300 ease-in-out"
        >
          {isPanelOpen && (
            <div className="p-4 h-full overflow-auto">
              {' '}
              <p>Code Snippet</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
