'use client';

import { ResizablePanel } from '@/components/ui/resizable';
import { useRef, useState } from 'react';
import { ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';

const OPEN_LAYOUT: number[] = [70, 30];
const CLOSED_LAYOUT: number[] = [100, 0];

export default function ResizablePanelHorizontal() {
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
  const layoutGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const toggleCodePanel = () => {
    const panelGroup = layoutGroupRef.current;
    if (panelGroup) {
      const isCurrentlyCollapsed = panelGroup.getLayout()[1] < 5;
      if (isCurrentlyCollapsed) {
        panelGroup.setLayout(OPEN_LAYOUT);
      } else {
        panelGroup.setLayout(CLOSED_LAYOUT);
      }
    }
  };
  return (
    <>
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
    </>
  );
}
