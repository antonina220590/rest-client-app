'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { PanelLeftClose, PanelRightClose } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { useResizableLayout } from '@/app/hooks/useResizableLayout';
import { RequestResponseArea } from './RequestResponseArea';
import MethodSelector from './MethodSelector';
import UrlInput from './UrlInput';
import {
  KeyValueItem,
  methods,
  ResizableContainerProps,
} from '@/app/interfaces';
import { useSyncUrlWithReduxState } from '@/app/hooks/useSyncUrlWithReduxState';
import { useRequestNotifications } from '@/app/hooks/useRequestNotifications';
import { useRequestHistory } from '@/app/store/hooks';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store/store';
import {
  setMethod,
  setUrl,
  setRequestBody,
  setBodyLanguage,
  setHeaders,
  sendRequest,
  clearResponse,
  setQueryParams,
} from '@/app/store/restClientSlice';
import { decodeFromBase64Url } from './helpers/encoding';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import CodeContainer from './codeGenerator/CodeContainer';

export default function ResizableContainer({
  initialMethod = 'GET',
  initialUrl = '',
  initialBody = '',
  initialHeaders = [],
}: ResizableContainerProps) {
  const {
    isPanelOpen: isCodePanelOpen,
    layoutGroupRef,
    togglePanel: toggleCodePanel,
    syncPanelState: syncCodePanelState,
    OPEN_LAYOUT,
    CLOSED_LAYOUT,
  } = useResizableLayout(false);

  const t = useTranslations('RESTful');
  const dispatch: AppDispatch = useDispatch();
  const [isClient, setIsClient] = useState(false);
  const methodFromRedux = useSelector(
    (state: RootState) => state.restClient.method
  );
  const url = useSelector((state: RootState) => state.restClient.url);
  const requestBody = useSelector(
    (state: RootState) => state.restClient.requestBody
  );
  const headers = useSelector((state: RootState) => state.restClient.headers);
  const queryParams = useSelector(
    (state: RootState) => state.restClient.queryParams
  );

  const historyItems = useRef(
    useSelector((state: RootState) => state.history.items)
  ).current;

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const searchParams = new URLSearchParams(window.location.search);

    let currentMethod = initialMethod;
    let currentUrl = initialUrl;
    let currentBody = initialBody;
    const currentHeaders: KeyValueItem[] = [...initialHeaders];
    const currentQueryParams: KeyValueItem[] = [];

    if (pathSegments.length >= 3) {
      const methodFromUrl = pathSegments[2].toUpperCase();
      if (methods.includes(methodFromUrl)) {
        currentMethod = methodFromUrl;
      }
    }

    if (pathSegments.length >= 4 && pathSegments[3]) {
      try {
        currentUrl = decodeFromBase64Url(pathSegments[3]);
      } catch {
        toast.error(t('Error of decoding of URL from path'));
      }
    }

    if (pathSegments.length >= 5 && pathSegments[4]) {
      try {
        currentBody = decodeFromBase64Url(pathSegments[4]);
      } catch {
        toast.error(t('Error of decoding Body from path'));
      }
    }

    searchParams.forEach((value, key) => {
      const alreadyExists = currentHeaders.some(
        (h) => h.key === key && h.value === value
      );
      if (!alreadyExists) {
        currentHeaders.push({ id: crypto.randomUUID(), key, value });
      }
    });

    const qs = new URLSearchParams(currentUrl.split('?')[1] || '');
    qs.forEach((value, key) => {
      currentQueryParams.push({ id: crypto.randomUUID(), key, value });
    });

    dispatch(setMethod(currentMethod));
    dispatch(setUrl(currentUrl));
    dispatch(setRequestBody(currentBody));
    dispatch(setBodyLanguage('json'));
    const filteredHeaders = currentHeaders.filter(
      (h) => h.key.trim() !== '' || h.value.trim() !== ''
    );

    dispatch(
      setHeaders(
        filteredHeaders.length > 0
          ? filteredHeaders
          : [{ id: crypto.randomUUID(), key: '', value: '' }]
      )
    );
    dispatch(setQueryParams(currentQueryParams));
    dispatch(clearResponse());
    setIsClient(true);
  }, [
    dispatch,
    t,
    initialMethod,
    initialUrl,
    initialBody,
    initialHeaders,
    historyItems,
  ]);

  useRequestHistory(historyItems);
  useSyncUrlWithReduxState();
  useRequestNotifications();

  const method = !isClient ? initialMethod : methodFromRedux;

  const handleMethodChange = useCallback(
    (newMethod: string) => {
      dispatch(setMethod(newMethod));
    },
    [dispatch]
  );

  const handleUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = event.target.value;
      dispatch(setUrl(newUrl));
    },
    [dispatch]
  );

  const handleSendRequest = useCallback(async () => {
    const payload = {
      method: methodFromRedux,
      targetUrl: url,
      headers: headers.filter((h) => h.key),
      queryParams: queryParams.filter((p) => p.key),
      body: requestBody,
    };

    try {
      await dispatch(sendRequest(payload));
    } catch {
      toast.error(t('requestFailed'));
    }
  }, [methodFromRedux, url, headers, queryParams, requestBody, dispatch, t]);

  return (
    <div className="relative w-full h-full">
      <Button
        variant="ghost"
        onClick={toggleCodePanel}
        size="icon"
        aria-label="Toggle Code Panel"
        className="absolute top-2 right-2 z-10 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isCodePanelOpen ? (
          <PanelRightClose className="h-6 w-6" />
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
          id="main-content-panel"
          order={1}
          defaultSize={isCodePanelOpen ? OPEN_LAYOUT[0] : CLOSED_LAYOUT[0]}
          minSize={30}
          className="flex flex-col"
        >
          <div className="flex flex-col h-full p-2 md:p-4">
            <div className="flex w-[90%] max-w-4xl mx-auto mt-5 justify-center">
              <MethodSelector value={method} onChange={handleMethodChange} />
              <UrlInput
                value={url}
                onChange={handleUrlChange}
                onSend={handleSendRequest}
              />
            </div>
            <div className="flex-grow overflow-hidden mt-5 max-w-8xl mx-auto w-[90%]">
              <RequestResponseArea />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-transparent" />

        <ResizablePanel
          id="code-panel"
          order={2}
          defaultSize={isCodePanelOpen ? OPEN_LAYOUT[1] : CLOSED_LAYOUT[1]}
          collapsible={true}
          collapsedSize={0}
          minSize={15}
          onCollapse={() => syncCodePanelState(false)}
          onExpand={() => syncCodePanelState(true)}
          className="transition-all duration-300 ease-in-out border-l-2"
        >
          {isCodePanelOpen && (
            <div className="p-4 h-full overflow-auto">
              <CodeContainer />
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
