export const dynamic = 'force-dynamic';
import ResizableContainer from '@/app/components/rest-client/ResizableContainer';
import { Toaster } from '@/components/ui/sonner';
import {
  methods,
  RestClientPageProps,
  RestClientParams,
  RestClientSearchParams,
} from '@/app/interfaces';
import { redirect } from 'next/navigation';
import {
  decodeFromBase64Url,
  encodeToBase64Url,
} from '@/app/components/rest-client/helpers/encoding';
import { ReduxProvider } from '@/app/store/providers';
import type { HistoryItem } from '@/app/interfaces';

export default async function RESTful({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: RestClientPageProps) {
  const params: RestClientParams = await paramsPromise;
  const searchParams: RestClientSearchParams = await searchParamsPromise;

  if (searchParams.restore) {
    const requestId = String(searchParams.restore);

    let history: HistoryItem[] = [];
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem('requestsHistory');
        history = storedHistory ? JSON.parse(storedHistory) : [];
      } catch (error) {
        console.error('Error reading history from localStorage:', error);
      }
    }

    const requestData = history.find((item) => item.id === requestId);

    if (requestData) {
      const encodedUrl = encodeToBase64Url(requestData.url);
      const encodedBody = requestData.body
        ? encodeToBase64Url(requestData.body)
        : '';
      const newUrl = `/${params.locale}/${requestData.method}/${encodedUrl}${
        encodedBody ? `/${encodedBody}` : ''
      }`;
      redirect(newUrl);
    } else {
      redirect(`/${params.locale}/GET`);
    }
  }

  const requestedMethod = params.method.toUpperCase();
  const isValidMethod = methods.includes(requestedMethod);
  if (!isValidMethod) {
    redirect(`/${params.locale}/GET`);
  }

  let initialUrl = '';
  let initialBody = '';

  if (params.slug?.[0]) {
    try {
      initialUrl = decodeFromBase64Url(params.slug[0]);
    } catch (error) {
      console.error('Failed to decode URL:', error);
    }
  }

  if (params.slug?.[1]) {
    try {
      initialBody = decodeFromBase64Url(params.slug[1]);
    } catch (error) {
      console.error('Failed to decode body:', error);
    }
  }

  const initialHeaders = Object.entries(searchParams)
    .filter(([key]) => key !== 'restore')
    .map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value: Array.isArray(value) ? value[0] || '' : value || '',
    }));

  return (
    <ReduxProvider>
      <div className="text-center">
        <div className="flex flex-col h-full mx-auto gap-2">
          <div className="flex h-[85dvh] w-full">
            <ResizableContainer
              initialMethod={requestedMethod}
              initialUrl={initialUrl}
              initialBody={initialBody}
              initialHeaders={
                initialHeaders.length
                  ? initialHeaders
                  : [{ id: crypto.randomUUID(), key: '', value: '' }]
              }
            />
          </div>
        </div>
      </div>
      <Toaster />
    </ReduxProvider>
  );
}
