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
import TabsComponent from './Tabs';

import { cn } from '@/lib/utils';

const VERTICAL_COLLAPSED_SIZE = 6.5;
const VERTICAL_OPEN_LAYOUT: number[] = [50, 50];
const VERTICAL_COLLAPSED_LAYOUT: number[] = [
  VERTICAL_COLLAPSED_SIZE,
  100 - VERTICAL_COLLAPSED_SIZE,
];

interface KeyValueItem {
  id: string;
  key?: string;
  value?: string;
}

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

  const [queryParams, setQueryParams] = useState<KeyValueItem[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);
  const [headers, setHeaders] = useState<KeyValueItem[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);

  const handleAddQueryParam = () => {
    setQueryParams((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', value: '' },
    ]);
  };
  const handleQueryParamKeyChange = (id: string | number, newKey: string) => {
    setQueryParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, key: newKey } : p))
    );
  };
  const handleQueryParamValueChange = (
    id: string | number,
    newValue: string
  ) => {
    setQueryParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: newValue } : p))
    );
  };
  const handleDeleteQueryParam = (id: string | number) => {
    if (
      queryParams.length <= 1 &&
      queryParams[0]?.key === '' &&
      queryParams[0]?.value === ''
    )
      return;
    setQueryParams((prev) => prev.filter((p) => p.id !== id));
    if (queryParams.length === 1) {
      setTimeout(
        () => setQueryParams([{ id: crypto.randomUUID(), key: '', value: '' }]),
        0
      );
    }
  };

  const handleAddHeader = () => {
    setHeaders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', value: '' },
    ]);
  };
  const handleHeaderKeyChange = (id: string | number, newKey: string) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, key: newKey } : h))
    );
  };
  const handleHeaderValueChange = (id: string | number, newValue: string) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, value: newValue } : h))
    );
  };
  const handleDeleteHeader = (id: string | number) => {
    if (
      headers.length <= 1 &&
      headers[0]?.key === '' &&
      headers[0]?.value === ''
    )
      return;
    setHeaders((prev) => prev.filter((h) => h.id !== id));
    if (headers.length === 1) {
      setTimeout(
        () => setHeaders([{ id: crypto.randomUUID(), key: '', value: '' }]),
        0
      );
    }
  };

  const [requestBody, setRequestBody] = useState<string>(
    '{\n  "key": "value"\n}'
  );
  const [bodyLanguage, setBodyLanguage] = useState<'json' | 'plaintext'>(
    'json'
  );

  const handleBodyChange = useCallback((value: string) => {
    setRequestBody(value);
  }, []);

  return (
    <ResizablePanelGroup
      ref={verticalLayoutGroupRef}
      direction="vertical"
      className="h-full rounded-lg flex"
    >
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
        className="transition-all duration-300 ease-in-out w-[80%] rounded-md mt-10 mx-auto p-0 bg-cta-secondary"
      >
        <div className="relative h-full w-full">
          <Button
            onClick={toggleRequestPanel}
            size="icon"
            aria-label="Toggle Request Panel"
            className="absolute top-0 right-1 z-10 bg-transparent hover:bg-cta-secondary h-10 w-9 p-0 cursor-pointer border-none shadow-none"
          >
            {isRequestPanelCollapsed ? (
              <ChevronUp className="h-8 w-8 text-cta-primary" />
            ) : (
              <ChevronDown className="h-6 w-8 text-cta-primary" />
            )}
          </Button>

          <div
            className={cn(
              'h-full overflow-auto',
              isRequestPanelCollapsed && 'overflow-hidden'
            )}
          >
            <TabsComponent
              onTabChange={expandRequestPanel}
              queryParams={queryParams}
              onAddQueryParam={handleAddQueryParam}
              onQueryParamKeyChange={handleQueryParamKeyChange}
              onQueryParamValueChange={handleQueryParamValueChange}
              onDeleteQueryParam={handleDeleteQueryParam}
              headers={headers}
              onAddHeader={handleAddHeader}
              onHeaderKeyChange={handleHeaderKeyChange}
              onHeaderValueChange={handleHeaderValueChange}
              onDeleteHeader={handleDeleteHeader}
              requestBody={requestBody}
              onBodyChange={handleBodyChange}
              bodyLanguage={bodyLanguage}
              showPrettifyButton={true}
              showLanguageSelector={true}
              onBodyLanguageChange={setBodyLanguage}
            />
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className="bg-transparent" />

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
        <div className="p-4 h-full overflow-auto border-2 border-red-500 mt-5">
          <p>Response</p>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
