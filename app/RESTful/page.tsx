import ResizableContainer from '../components/rest-client/ResizableContainer';

export default function RESTful() {
  return (
    <div className="text-center">
      <h1>RESTful client page</h1>
      <div className="flex flex-col h-full mx-auto gap-2">
        <div className="flex h-screen w-full">
          <ResizableContainer />
        </div>
      </div>
    </div>
  );
}
