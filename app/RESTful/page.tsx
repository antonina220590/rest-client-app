import ResizableContainer from '../components/rest-client/ResizableContainer';
import { Toaster } from '@/components/ui/sonner';

export default function RESTful() {
  return (
    <div className="text-center">
      <div className="flex flex-col h-full mx-auto gap-2">
        <div className="flex h-[80vh] w-full">
          <ResizableContainer />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
