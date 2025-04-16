export const dynamic = 'force-dynamic';
import ResizableContainer from '@/app/components/rest-client/ResizableContainer/ResizableContainer';
import { Toaster } from '@/components/ui/sonner';
import {
  KeyValueItem,
  methods,
  RestClientPageProps,
  RestClientParams,
  RestClientSearchParams,
} from '@/app/interfaces';
import { notFound } from 'next/navigation';
import { decodeFromBase64Url } from '@/app/components/rest-client/helpers/encoding';
import { ReduxProvider } from '@/app/store/providers';

export default async function RESTful({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: RestClientPageProps) {
  const params: RestClientParams = await paramsPromise;
  const searchParams: RestClientSearchParams = await searchParamsPromise;

  const requestedMethod = params.method.toUpperCase();
  const isValidMethod = methods.includes(requestedMethod);
  if (!isValidMethod) {
    notFound();
  }
  const initialMethod = isValidMethod ? requestedMethod : 'GET';

  let initialUrl: string = '';
  let initialBody: string = '';

  if (params.slug && params.slug.length > 0) {
    try {
      initialUrl = decodeFromBase64Url(params.slug[0]);
    } catch {}
  }
  if (params.slug && params.slug.length > 1) {
    try {
      initialBody = decodeFromBase64Url(params.slug[1]);
    } catch {}
  }
  const initialHeaders: KeyValueItem[] = Object.entries(searchParams)
    .map(([key, value]) => ({
      id: crypto.randomUUID(),
      key: key,
      value: Array.isArray(value) ? value[0] || '' : value || '',
    }))
    .concat(
      Object.keys(searchParams).length === 0
        ? [{ id: crypto.randomUUID(), key: '', value: '' }]
        : []
    );

  if (
    initialHeaders.length === 1 &&
    !initialHeaders[0].key &&
    !initialHeaders[0].value &&
    Object.keys(searchParams).length > 0
  ) {
  } else if (
    Object.keys(searchParams).length === 0 &&
    initialHeaders.length === 1 &&
    !initialHeaders[0].key
  ) {
  }

  return (
    <>
      <ReduxProvider>
        <div className="text-center">
          <div className="flex flex-col h-full mx-auto gap-2">
            <div className="flex h-[85dvh] w-full">
              <ResizableContainer
                initialMethod={initialMethod}
                initialUrl={initialUrl}
                initialBody={initialBody}
                initialHeaders={initialHeaders}
              />
            </div>
          </div>
        </div>
        <Toaster />
      </ReduxProvider>
    </>
  );
}
