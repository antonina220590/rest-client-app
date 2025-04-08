'use client';

import React, { useState, useCallback } from 'react';
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
import { useRouter, usePathname } from 'next/navigation';

interface ResizableContainerProps {
  initialMethod?: string;
}

export default function ResizableContainer({
  initialMethod = 'GET',
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
  const router = useRouter();
  const pathname = usePathname();
  const [queryParams, setQueryParams] = useState<KeyValueItem[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);
  const [headers, setHeaders] = useState<KeyValueItem[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);
  const [requestBody, setRequestBody] = useState<string>('');
  const [bodyLanguage, setBodyLanguage] = useState<BodyLanguage>('json');
  const [url, setUrl] = useState<string>('');
  const [method, setMethod] = useState<string>(initialMethod);

  const [responseData, setResponseData] = useState<string | null>(null);
  const [responseContentType, setResponseContentType] = useState<string | null>(
    null
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddQueryParam = () =>
    setQueryParams((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', value: '' },
    ]);
  const handleQueryParamKeyChange = (id: string | number, newKey: string) =>
    setQueryParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, key: newKey } : p))
    );
  const handleQueryParamValueChange = (id: string | number, newValue: string) =>
    setQueryParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: newValue } : p))
    );
  const handleDeleteQueryParam = (id: string | number) => {
    if (
      queryParams.length <= 1 &&
      !queryParams[0]?.key &&
      !queryParams[0]?.value
    )
      return;
    const newParams = queryParams.filter((p) => p.id !== id);
    setQueryParams(
      newParams.length > 0
        ? newParams
        : [{ id: crypto.randomUUID(), key: '', value: '' }]
    );
  };

  const handleAddHeader = () =>
    setHeaders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', value: '' },
    ]);
  const handleHeaderKeyChange = (id: string | number, newKey: string) =>
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, key: newKey } : h))
    );
  const handleHeaderValueChange = (id: string | number, newValue: string) =>
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, value: newValue } : h))
    );

  const handleDeleteHeader = (id: string | number) => {
    if (headers.length <= 1 && !headers[0]?.key && !headers[0]?.value) return;
    const newHeaders = headers.filter((h) => h.id !== id);
    setHeaders(
      newHeaders.length > 0
        ? newHeaders
        : [{ id: crypto.randomUUID(), key: '', value: '' }]
    );
  };

  const handleBodyChange = useCallback((value: string) => {
    setRequestBody(value);
  }, []);

  const handleBodyLanguageChange = useCallback((lang: BodyLanguage) => {
    setBodyLanguage(lang);
  }, []);

  const handleMethodChange = useCallback(
    (newMethod: string) => {
      setMethod(newMethod);
      if (pathname) {
        const pathParts = pathname.split('/');
        if (pathParts.length >= 3) {
          pathParts[2] = newMethod;
          const newPathname = pathParts.join('/');
          router.replace(newPathname);
        }
      }
    },
    [pathname, router]
  );

  const handleUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(event.target.value);
    },
    []
  );

  const handleSendRequest = useCallback(async () => {
    setIsLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    setResponseContentType(null);
    try {
      let headersToSend = headers.filter((h) => h.key);
      if (
        (method === 'POST' || method === 'PUT' || method === 'PATCH') &&
        requestBody &&
        bodyLanguage === 'json'
      ) {
        const hasContentType = headersToSend.some(
          (h) => h.key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          headersToSend = [
            ...headersToSend,
            {
              id: 'content-type-auto',
              key: 'Content-Type',
              value: 'application/json',
            },
          ];
        }
      }

      const proxyPayload = {
        method: method,
        targetUrl: url,
        headers: headersToSend,
        queryParams: queryParams.filter((p) => p.key),
        body: requestBody,
      };

      const response = await fetch('/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proxyPayload),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Proxy error response' }));
        throw new Error(
          `Proxy error: ${response.status} ${response.statusText}. ${errorData?.message || ''}`
        );
      }

      const proxyResponse = await response.json();

      if (proxyResponse.error) {
        toast.error('API Request Failed', { description: proxyResponse.error });
        setResponseData(proxyResponse.body || proxyResponse.error);
        setResponseStatus(proxyResponse.status || 500);
      } else {
        setResponseData(proxyResponse.body);
        setResponseStatus(proxyResponse.status);
        const contentTypeHeader = proxyResponse.headers
          ? Object.entries(proxyResponse.headers).find(
              ([key]) => key.toLowerCase() === 'content-type'
            )
          : undefined;
        setResponseContentType(
          contentTypeHeader ? String(contentTypeHeader[1]) : null
        );
        toast.success('Request successful!');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(t('Request Failed'), { description: errorMessage });
      setResponseData(errorMessage);
      setResponseStatus(500);
    } finally {
      setIsLoading(false);
    }
  }, [method, url, headers, queryParams, requestBody, bodyLanguage, t]);

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
