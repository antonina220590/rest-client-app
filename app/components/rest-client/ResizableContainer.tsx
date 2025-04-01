// 'use client';

// import React, { useState, useRef } from 'react';
// import { PanelLeftClose, PanelRightClose } from 'lucide-react';
// import {
//   ResizableHandle,
//   ResizablePanel,
//   ResizablePanelGroup,
// } from '@/components/ui/resizable';
// import { type ImperativePanelGroupHandle } from 'react-resizable-panels';
// import { Button } from '@/components/ui/button';
// import TabsComponent from './Tabs';
// import MethodSelector from './MethodSelector';
// import UrlInput from './UrlInput';

// const OPEN_LAYOUT: number[] = [70, 30];
// const CLOSED_LAYOUT: number[] = [100, 0];

// export default function ResizableContainer() {
//   const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
//   const layoutGroupRef = useRef<ImperativePanelGroupHandle>(null);

//   const toggleCodePanel = () => {
//     const panelGroup = layoutGroupRef.current;
//     if (panelGroup) {
//       if (isCodePanelOpen) {
//         panelGroup.setLayout(CLOSED_LAYOUT);
//       } else {
//         panelGroup.setLayout(OPEN_LAYOUT);
//       }
//     }
//   };

//   return (
//     <div className="relative w-full h-full">
//       <Button
//         onClick={toggleCodePanel}
//         variant="ghost"
//         size="icon"
//         aria-label="Toggle Code Panel"
//         className="absolute top-1 right-2 z-10 border bg-background hover:bg-muted"
//       >
//         {isCodePanelOpen ? (
//           <PanelRightClose className="h-4 w-4" />
//         ) : (
//           <PanelLeftClose className="h-4 w-4" />
//         )}
//       </Button>

//       <ResizablePanelGroup
//         ref={layoutGroupRef}
//         direction="horizontal"
//         className="h-full w-full rounded-lg"
//       >
//         <ResizablePanel
//           id="main-content-panel"
//           defaultSize={isCodePanelOpen ? OPEN_LAYOUT[0] : CLOSED_LAYOUT[0]}
//           minSize={30}
//         >
//           <ResizablePanelGroup
//             direction="vertical"
//             className="h-full flex gap-2 mx-auto items-center"
//           >
//             <div className="flex w-4xl max-w-[85vw] mx-auto mt-5 justify-center">
//               <MethodSelector />
//               <UrlInput />
//             </div>
//             <ResizablePanel
//               id="request-config-panel"
//               order={1}
//               defaultSize={50}
//               minSize={10}
//               className="border-2 border-blue-500 w-[70%] rounded-md"
//             >
//               <div className="p-4 h-full overflow-auto">
//                 <TabsComponent />
//               </div>
//             </ResizablePanel>

//             <ResizableHandle />

//             <ResizablePanel
//               id="response-panel"
//               order={2}
//               defaultSize={50}
//               minSize={20}
//               className="border-2 border-red-500 w-[90%] rounded-md"
//             >
//               <div className="p-4 h-full overflow-auto">
//                 <p>Response</p>
//               </div>
//             </ResizablePanel>
//           </ResizablePanelGroup>
//         </ResizablePanel>
//         <ResizableHandle />
//         <ResizablePanel
//           id="code-panel"
//           order={2}
//           defaultSize={isCodePanelOpen ? OPEN_LAYOUT[1] : CLOSED_LAYOUT[1]}
//           collapsible={true}
//           collapsedSize={0}
//           minSize={15}
//           onCollapse={() => {
//             if (isCodePanelOpen) setIsCodePanelOpen(false);
//           }}
//           onExpand={() => {
//             if (!isCodePanelOpen) setIsCodePanelOpen(true);
//           }}
//           className="transition-all duration-300 ease-in-out border-2 border-red-500"
//         >
//           {isCodePanelOpen && (
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
        className="absolute top-1 right-2 z-10 border bg-background hover:bg-muted"
      >
        {isPanelOpen ? (
          <PanelRightClose className="h-4 w-4" />
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
          className="flex "
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
