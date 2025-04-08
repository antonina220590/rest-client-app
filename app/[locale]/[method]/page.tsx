import ResizableContainer from '@/app/components/rest-client/ResizableContainer';
import { Toaster } from '@/components/ui/sonner';
import { methods } from '@/app/interfaces';
import { redirect } from 'next/navigation';
interface RestClientPageProps {
  params: {
    locale: string;
    method: string;
  };
}
export default async function RESTful({
  params: paramsMaybePromise,
}: RestClientPageProps) {
  const params = await paramsMaybePromise;
  const requestedMethod = params.method.toUpperCase();
  const isValidMethod = methods.includes(requestedMethod);
  if (!isValidMethod) {
    redirect(`/${params.locale}/GET`);
  }

  const initialMethod = isValidMethod ? requestedMethod : 'GET';

  return (
    <>
      <div className="text-center">
        <div className="flex flex-col h-full mx-auto gap-2">
          <div className="flex h-[85dvh] w-full">
            <ResizableContainer initialMethod={initialMethod} />
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
