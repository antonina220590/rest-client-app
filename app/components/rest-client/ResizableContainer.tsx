// 'use client';

// import React from 'react';
// import { PanelLeftClose, PanelRightClose } from 'lucide-react';
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from '@/components/ui/resizable';
// import { Button } from '@/components/ui/button';

// import { useResizableLayout } from '@/app/hooks/useResizableLayout';
// import { RequestResponseArea } from './RequestResponseArea';
// import MethodSelector from './MethodSelector';
// import UrlInput from './UrlInput';

// export default function ResizableContainer() {
//   const {
//     isPanelOpen,
//     layoutGroupRef,
//     togglePanel,
//     syncPanelState,
//     OPEN_LAYOUT,
//     CLOSED_LAYOUT,
//   } = useResizableLayout(false);

//   return (
//     <div className="relative w-full h-full">
//       <Button
//         onClick={togglePanel}
//         variant="ghost"
//         size="icon"
//         aria-label="Toggle Code Panel"
//         className="absolute top-2 right-2 z-10 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//       >
//         {isPanelOpen ? (
//           <PanelRightClose className="h-6 w-6 " />
//         ) : (
//           <PanelLeftClose className="h-4 w-4" />
//         )}
//       </Button>

//       <ResizablePanelGroup
//         ref={layoutGroupRef}
//         direction="horizontal"
//         className="h-full w-full border rounded-lg"
//       >
//         <ResizablePanel
//           id="main-content-panel"
//           order={1}
//           defaultSize={isPanelOpen ? OPEN_LAYOUT[0] : CLOSED_LAYOUT[0]}
//           minSize={30}
//           className="flex flex-col"
//         >
//           <div className="flex flex-col h-full p-2 md:p-4">
//             <div className="flex w-[90%] max-w-4xl mx-auto mt-5 justify-center">
//               <MethodSelector />
//               <UrlInput />
//             </div>
//             <div className="flex-grow w-[90%] max-w-4xl mx-auto overflow-hidden justify-center">
//               <RequestResponseArea />
//             </div>
//           </div>
//         </ResizablePanel>

//         <ResizableHandle withHandle />

//         <ResizablePanel
//           id="code-panel"
//           order={2}
//           defaultSize={isPanelOpen ? OPEN_LAYOUT[1] : CLOSED_LAYOUT[1]}
//           collapsible={true}
//           collapsedSize={0}
//           minSize={15}
//           onCollapse={() => syncPanelState(false)}
//           onExpand={() => syncPanelState(true)}
//           className="transition-all duration-300 ease-in-out"
//         >
//           {isPanelOpen && (
//             <div className="p-4 h-full overflow-auto">
//               <p>Code Snippet</p>
//             </div>
//           )}
//         </ResizablePanel>
//       </ResizablePanelGroup>
//     </div>
//   );
// }

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
import { BodyLanguage } from './BodyEditor';

interface KeyValueItem {
  id: string;
  key?: string;
  value?: string;
}

export default function ResizableContainer() {
  const {
    isPanelOpen: isCodePanelOpen,
    layoutGroupRef,
    togglePanel: toggleCodePanel,
    syncPanelState: syncCodePanelState,
    OPEN_LAYOUT,
    CLOSED_LAYOUT,
  } = useResizableLayout(false);

  const [queryParams, setQueryParams] = useState<KeyValueItem[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);
  const [headers, setHeaders] = useState<KeyValueItem[]>([
    { id: crypto.randomUUID(), key: '', value: '' },
  ]);
  const [requestBody, setRequestBody] = useState<string>('');
  const [bodyLanguage, setBodyLanguage] = useState<BodyLanguage>('json');
  const [_url, _setUrl] = useState<string>('');
  const [_method, _setMethod] = useState<string>('');

  const [responseData, _setResponseData] = useState<string | null>(null);
  const [responseContentType, _setResponseContentType] = useState<
    string | null
  >(null);
  const [responseStatus, _setResponseStatus] = useState<number | null>(null);
  const [isLoading, _setIsLoading] = useState<boolean>(false);

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
              <MethodSelector />
              <UrlInput />
            </div>
            <div className="flex-grow overflow-hidden mt-5 max-w-4xl mx-auto w-[90%]">
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
