import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export default function ResizableContainer() {
  return (
    <ResizablePanelGroup direction="vertical" className="flex gap-2">
      <ResizablePanel className="border-2 border-blue-500">One</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="border-2 border-red-500">Two</ResizablePanel>
    </ResizablePanelGroup>
  );
}
