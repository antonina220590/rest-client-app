'use client';

import React, { useCallback, useEffect, useRef } from 'react';
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
import { BodyLanguage, KeyValueItem } from '@/app/interfaces';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { encodeToBase64Url } from './helpers/encoding';
import { useDebounce } from '@/app/hooks/useDebounce';

import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '@/app/store/store';
import {
  setMethod,
  setUrl,
  setRequestBody,
  setBodyLanguage,
  setHeaders,
  addHeader,
  updateHeaderKey,
  updateHeaderValue,
  deleteHeader,
  addQueryParam,
  updateQueryParamKey,
  updateQueryParamValue,
  deleteQueryParam,
  sendRequest,
} from '@/app/store/restClientSlice';
interface ResizableContainerProps {
  initialMethod?: string;
  initialUrl?: string;
  initialBody?: string;
  initialHeaders?: KeyValueItem[];
}

export default function ResizableContainer({
  initialMethod = 'GET',
  initialUrl = '',
  initialBody = '',
  initialHeaders = [{ id: crypto.randomUUID(), key: '', value: '' }],
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
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();

  const method = useSelector((state: RootState) => state.restClient.method);
  const url = useSelector((state: RootState) => state.restClient.url);
  const requestBody = useSelector(
    (state: RootState) => state.restClient.requestBody
  );
  const bodyLanguage = useSelector(
    (state: RootState) => state.restClient.bodyLanguage
  );
  const headers = useSelector((state: RootState) => state.restClient.headers);
  const queryParams = useSelector(
    (state: RootState) => state.restClient.queryParams
  );
  const responseData = useSelector(
    (state: RootState) => state.restClient.responseData
  );
  const responseStatus = useSelector(
    (state: RootState) => state.restClient.responseStatus
  );
  const responseContentType = useSelector(
    (state: RootState) => state.restClient.responseContentType
  );
  const isLoading = useSelector(
    (state: RootState) => state.restClient.isLoading
  );
  const error = useSelector((state: RootState) => state.restClient.error);

  const debouncedUrl = useDebounce(url, 500);
  const debouncedRequestBody = useDebounce(requestBody, 500);

  useEffect(() => {
    dispatch(setMethod(initialMethod));
    dispatch(setUrl(initialUrl));
    dispatch(setRequestBody(initialBody));
    dispatch(setBodyLanguage('json'));
    dispatch(setHeaders(initialHeaders));
  }, [dispatch, initialBody, initialHeaders, initialMethod, initialUrl]);

  useEffect(() => {
    const encodedUrl = debouncedUrl
      ? encodeToBase64Url(debouncedUrl)
      : undefined;
    const encodedBody = debouncedRequestBody
      ? encodeToBase64Url(debouncedRequestBody)
      : undefined;

    const locale = pathname.split('/')[1];
    const pathSegments = [`/${locale}`, method];
    if (encodedUrl) {
      pathSegments.push(encodedUrl);
      if (encodedBody) {
        pathSegments.push(encodedBody);
      }
    }
    const newPathname = pathSegments.join('/');

    const headerParams = new URLSearchParams();
    headers.forEach((header) => {
      if (header.key) {
        headerParams.set(header.key, header.value);
      }
    });
    const newSearchString = headerParams.toString();
    const newFullAppUrl =
      newPathname + (newSearchString ? `?${newSearchString}` : '');
    const currentFullAppUrl = window.location.pathname + window.location.search;

    if (newFullAppUrl !== currentFullAppUrl) {
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', newFullAppUrl);
      }
    }
  }, [
    method,
    debouncedUrl,
    debouncedRequestBody,
    headers,
    pathname,
    currentSearchParams,
  ]);

  const prevError = useRef<string | null>(null);
  const prevIsLoading = useRef<boolean>(false);

  useEffect(() => {
    if (error && error !== prevError.current) {
      toast.error(t('Request Failed'), { description: error });
    }
    if (
      prevIsLoading.current &&
      !isLoading &&
      !error &&
      responseStatus !== null
    ) {
      toast.success(t('Request successful!'));
    }
    prevError.current = error;
    prevIsLoading.current = isLoading;
  }, [error, isLoading, responseStatus, t]);

  const handleAddQueryParam = useCallback(() => {
    dispatch(addQueryParam());
  }, [dispatch]);

  const handleQueryParamKeyChange = useCallback(
    (id: string | number, newKey: string) => {
      dispatch(updateQueryParamKey({ id, key: newKey }));
    },
    [dispatch]
  );

  const handleQueryParamValueChange = useCallback(
    (id: string | number, newValue: string) => {
      dispatch(updateQueryParamValue({ id, value: newValue }));
    },
    [dispatch]
  );

  const handleDeleteQueryParam = useCallback(
    (id: string | number) => {
      if (
        queryParams.length <= 1 &&
        !queryParams[0]?.key &&
        !queryParams[0]?.value
      ) {
        return;
      }

      dispatch(deleteQueryParam(id));
    },
    [dispatch, queryParams]
  );
  const handleAddHeader = useCallback(() => {
    dispatch(addHeader());
  }, [dispatch]);

  const handleHeaderKeyChange = useCallback(
    (id: string | number, newKey: string) => {
      dispatch(updateHeaderKey({ id, key: newKey }));
    },
    [dispatch]
  );

  const handleHeaderValueChange = useCallback(
    (id: string | number, newValue: string) => {
      dispatch(updateHeaderValue({ id, value: newValue }));
    },
    [dispatch]
  );

  const handleDeleteHeader = useCallback(
    (id: string | number) => {
      if (headers.length <= 1 && !headers[0]?.key && !headers[0]?.value) {
        return;
      }

      dispatch(deleteHeader(id));
    },
    [dispatch, headers]
  );

  const handleBodyChange = useCallback(
    (value: string) => {
      dispatch(setRequestBody(value));
    },
    [dispatch]
  );

  const handleBodyLanguageChange = useCallback(
    (lang: BodyLanguage) => {
      dispatch(setBodyLanguage(lang));
    },
    [dispatch]
  );

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
      method: method,
      targetUrl: url,
      headers: headers,
      queryParams: queryParams,
      body: requestBody,
    };
    dispatch(sendRequest(payload));
  }, [dispatch, method, url, headers, queryParams, requestBody]);

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
          <PanelRightClose className="h-6 w-6 " />
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
              <RequestResponseArea
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
                responseData={responseData}
                responseContentType={responseContentType}
                responseStatus={responseStatus}
                isLoading={isLoading}
              />
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
              <p>Generated Code</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
