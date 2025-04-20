'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import TabsComponent from '../TabsComponent/TabsComponent';
import RequestBodyEditor from '../BodyEditor/BodyEditor';
import { cn } from '@/lib/utils';
import { BodyLanguage } from '@/app/interfaces';
import Spinner from '../../Spinner';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store/store';
import {
  addQueryParam,
  updateQueryParamKey,
  updateQueryParamValue,
  deleteQueryParam,
  addHeader,
  updateHeaderKey,
  updateHeaderValue,
  deleteHeader,
  setRequestBody,
  setBodyLanguage,
  setActiveTab,
} from '@/app/store/restClientSlice';
import useFormattedResponse from '@/app/hooks/useFormattedResponse';
import useCollapsiblePanel from '@/app/hooks/useCollapsiblePanel';

export function RequestResponseArea() {
  const [isMounted, setIsMounted] = useState(false);
  const dispatch: AppDispatch = useDispatch();

  const {
    isCollapsed: isRequestPanelCollapsed,
    panelGroupRef: verticalLayoutGroupRef,
    togglePanel: toggleRequestPanel,
    openPanel: expandRequestPanel,
    syncPanelState,
    OPEN_LAYOUT: VERTICAL_OPEN_LAYOUT,
    COLLAPSED_LAYOUT: VERTICAL_COLLAPSED_LAYOUT,
    COLLAPSED_SIZE: VERTICAL_COLLAPSED_SIZE,
  } = useCollapsiblePanel(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeTab = useSelector(
    (state: RootState) => state.restClient.activeTab
  );
  const queryParams = useSelector(
    (state: RootState) => state.restClient.queryParams
  );
  const headers = useSelector((state: RootState) => state.restClient.headers);
  const requestBody = useSelector(
    (state: RootState) => state.restClient.requestBody
  );
  const bodyLanguage = useSelector(
    (state: RootState) => state.restClient.bodyLanguage
  );
  const responseStatus = useSelector(
    (state: RootState) => state.restClient.responseStatus
  );
  const isLoading = useSelector(
    (state: RootState) => state.restClient.isLoading
  );

  const { displayValue, displayLanguage } = useFormattedResponse();

  const handleAddQueryParam = useCallback(
    () => dispatch(addQueryParam()),
    [dispatch]
  );
  const handleQueryParamKeyChange = useCallback(
    (id: string | number, newKey: string) =>
      dispatch(updateQueryParamKey({ id, key: newKey })),
    [dispatch]
  );
  const handleQueryParamValueChange = useCallback(
    (id: string | number, newValue: string) =>
      dispatch(updateQueryParamValue({ id, value: newValue })),
    [dispatch]
  );
  const handleDeleteQueryParam = useCallback(
    (id: string | number) => {
      if (
        queryParams.length <= 1 &&
        !queryParams[0]?.key &&
        !queryParams[0]?.value
      )
        return;
      dispatch(deleteQueryParam(id));
    },
    [dispatch, queryParams]
  );

  const handleAddHeader = useCallback(() => dispatch(addHeader()), [dispatch]);
  const handleHeaderKeyChange = useCallback(
    (id: string | number, newKey: string) =>
      dispatch(updateHeaderKey({ id, key: newKey })),
    [dispatch]
  );
  const handleHeaderValueChange = useCallback(
    (id: string | number, newValue: string) =>
      dispatch(updateHeaderValue({ id, value: newValue })),
    [dispatch]
  );
  const handleDeleteHeader = useCallback(
    (id: string | number) => {
      if (headers.length <= 1 && !headers[0]?.key && !headers[0]?.value) return;
      dispatch(deleteHeader(id));
    },
    [dispatch, headers]
  );

  const handleBodyChange = useCallback(
    (value: string) => dispatch(setRequestBody(value)),
    [dispatch]
  );
  const handleBodyLanguageChange = useCallback(
    (lang: BodyLanguage) => dispatch(setBodyLanguage(lang)),
    [dispatch]
  );

  const handleTabChange = useCallback(
    (newTabValue: string) => {
      dispatch(setActiveTab(newTabValue));
      if (isRequestPanelCollapsed) {
        expandRequestPanel();
      }
    },
    [dispatch, expandRequestPanel, isRequestPanelCollapsed]
  );

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
        onCollapse={() => syncPanelState(true)}
        onExpand={() => syncPanelState(false)}
        className={cn(
          `transition-all duration-300 ease-in-out rounded-md bg-cta-secondary w-[70%] mx-auto max-w-4xl min-h-[40px]`
        )}
      >
        <div className="relative h-full w-full">
          <Button
            onClick={toggleRequestPanel}
            variant="ghost"
            size="icon"
            aria-label="Toggle Request Panel"
            className="absolute top-1 right-2 z-10 h-8 w-8 p-0 cursor-pointer border-none shadow-none"
          >
            {isRequestPanelCollapsed ? (
              <ChevronUp className="h-5 w-5 text-cta-primary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-cta-primary" />
            )}
          </Button>
          <div
            className={cn(
              'h-full overflow-auto',
              isRequestPanelCollapsed && 'overflow-hidden'
            )}
          >
            {isMounted ? (
              <TabsComponent
                value={activeTab}
                onValueChange={handleTabChange}
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
                onBodyLanguageChange={handleBodyLanguageChange}
                showPrettifyButton={true}
                showLanguageSelector={true}
              />
            ) : (
              <div className="p-4">Loading tabs...</div>
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className="bg-transparent" />

      <ResizablePanel
        id="response-panel"
        order={2}
        defaultSize={
          isRequestPanelCollapsed
            ? VERTICAL_COLLAPSED_LAYOUT[1]
            : VERTICAL_OPEN_LAYOUT[1]
        }
        minSize={15}
        className="flex"
      >
        <div className="p-2 md:p-4 h-full flex flex-col w-full">
          <div className="text-xs text-muted-foreground mb-1 flex-shrink-0 flex justify-between items-center px-1">
            <span>
              {isMounted && responseStatus !== null && !isLoading && (
                <span>
                  Status:{' '}
                  <span
                    className={cn(
                      responseStatus >= 400
                        ? 'text-destructive font-semibold'
                        : responseStatus >= 200 && responseStatus < 300
                          ? 'text-green-600 font-semibold'
                          : ''
                    )}
                  >
                    {responseStatus}
                  </span>
                </span>
              )}
            </span>
          </div>
          <div className="flex-grow overflow-auto border rounded-md bg-accent h-full text-sm">
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-accent">
                <Spinner />
              </div>
            ) : (
              <RequestBodyEditor
                contentEditable={true}
                value={displayValue}
                language={displayLanguage}
                readOnly={true}
                showPrettifyButton={false}
                showLanguageSelector={false}
                lineWrapping={false}
              />
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
