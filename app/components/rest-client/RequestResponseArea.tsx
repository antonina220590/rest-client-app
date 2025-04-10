'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { type ImperativePanelGroupHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import TabsComponent from './TabsComponent';
import RequestBodyEditor from './BodyEditor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BodyLanguage } from '@/app/interfaces';
import Spinner from '../Spinner';
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
} from '@/app/store/restClientSlice';

const VERTICAL_COLLAPSED_SIZE = 2;
const VERTICAL_OPEN_LAYOUT: number[] = [40, 60];
const VERTICAL_COLLAPSED_LAYOUT: number[] = [
  VERTICAL_COLLAPSED_SIZE,
  100 - VERTICAL_COLLAPSED_SIZE,
];

export function RequestResponseArea() {
  const [isRequestPanelCollapsed, setIsRequestPanelCollapsed] = useState(false);
  const verticalLayoutGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const [isMounted, setIsMounted] = useState(false);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  const responseData = useSelector(
    (state: RootState) => state.restClient.responseData
  );
  const responseContentType = useSelector(
    (state: RootState) => state.restClient.responseContentType
  );
  const responseStatus = useSelector(
    (state: RootState) => state.restClient.responseStatus
  );
  const isLoading = useSelector(
    (state: RootState) => state.restClient.isLoading
  );

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
      setIsRequestPanelCollapsed(!isRequestPanelCollapsed);
    }
  };

  const syncRequestPanelState = (isCollapsed: boolean) => {
    if (isCollapsed !== isRequestPanelCollapsed) {
      setIsRequestPanelCollapsed(isCollapsed);
    }
  };

  const { displayValue, displayLanguage } = useMemo(() => {
    if (isLoading) {
      return { displayValue: '', displayLanguage: 'plaintext' as BodyLanguage };
    }

    if (responseData !== null && responseData !== undefined) {
      const isErrorStatus = responseStatus !== null && responseStatus >= 400;

      if (isErrorStatus) {
        try {
          const parsedError = JSON.parse(responseData);
          if (
            typeof parsedError === 'object' &&
            parsedError !== null &&
            typeof parsedError.error === 'string'
          ) {
            return {
              displayValue: parsedError.error,
              displayLanguage: 'plaintext' as BodyLanguage,
            };
          }
        } catch {}

        return {
          displayValue: responseData,
          displayLanguage: 'plaintext' as BodyLanguage,
        };
      }
      const isJson = responseContentType
        ?.toLowerCase()
        .includes('application/json');
      if (isJson) {
        try {
          const parsed = JSON.parse(responseData);
          const pretty = JSON.stringify(parsed, null, 2);
          return {
            displayValue: pretty,
            displayLanguage: 'json' as BodyLanguage,
          };
        } catch (e) {
          toast.error(
            `Response JSON parse error: ${e instanceof Error ? e.message : String(e)}`
          );
          return {
            displayValue: responseData,
            displayLanguage: 'plaintext' as BodyLanguage,
          };
        }
      } else {
        return {
          displayValue: responseData,
          displayLanguage: 'plaintext' as BodyLanguage,
        };
      }
    }

    return { displayValue: '', displayLanguage: 'plaintext' as BodyLanguage };
  }, [responseData, responseContentType, responseStatus, isLoading]);

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
              onBodyLanguageChange={handleBodyLanguageChange}
              showPrettifyButton={true}
              showLanguageSelector={true}
            />
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
              />
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
