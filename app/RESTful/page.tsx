import MethodSelector from '../components/rest-client/MethodSelector';
import ResizableContainer from '../components/rest-client/ResizableContainer';
import UrlInput from '../components/rest-client/UrlInput';

export default function RESTful() {
  return (
    <div className="text-center">
      <h1>RESTful client page</h1>
      <div className="flex flex-col h-full max-w-[1336px] mx-auto gap-2">
        <div className="flex w-4xl max-w-[85vw] mx-auto mt-5 justify-center">
          <MethodSelector />
          <UrlInput />
        </div>
        <div className="h-screen">
          <ResizableContainer />
        </div>
      </div>
    </div>
  );
}
