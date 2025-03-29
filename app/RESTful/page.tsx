import MethodSelector from '../components/rest-client/MethodSelector';
import UrlInput from '../components/rest-client/UrlInput';

export default function RESTful() {
  return (
    <div className="text-center">
      <h1>RESTful client page</h1>
      <div className="flex w-4xl max-w-[85vw] mx-auto mt-5">
        <MethodSelector />
        <UrlInput />
      </div>
    </div>
  );
}
