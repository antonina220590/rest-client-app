import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { useDebounce } from './useDebounce';
import { encodeToBase64Url } from '@/app/components/rest-client/helpers/encoding';
import type { RootState } from '@/app/store/store';
import { useSearchParams } from 'next/navigation';

export function useSyncUrlWithReduxState() {
  const method = useSelector((state: RootState) => state.restClient.method);
  const url = useSelector((state: RootState) => state.restClient.url);
  const requestBody = useSelector(
    (state: RootState) => state.restClient.requestBody
  );
  const headers = useSelector((state: RootState) => state.restClient.headers);
  const debouncedUrl = useDebounce(url, 500);
  const debouncedRequestBody = useDebounce(requestBody, 500);

  const pathname = usePathname();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('restore')) return;

    const encodedUrl = debouncedUrl
      ? encodeToBase64Url(debouncedUrl)
      : undefined;
    const encodedBody =
      debouncedRequestBody && requestBody
        ? encodeToBase64Url(debouncedRequestBody)
        : undefined;

    const locale = pathname ? pathname.split('/')[1] : 'en';

    const pathSegments = [`/${locale}`, method];
    if (encodedUrl) {
      pathSegments.push(encodedUrl);
      if (encodedBody) {
        pathSegments.push(encodedBody);
      }
    }
    const newPathname = pathSegments.join('/');

    const headerParams = new URLSearchParams();
    headers.forEach((header) => {
      if (header.key) {
        headerParams.set(header.key, header.value);
      }
    });
    const newSearchString = headerParams.toString();

    const newFullAppUrl =
      newPathname + (newSearchString ? `?${newSearchString}` : '');

    if (typeof window !== 'undefined') {
      const currentFullAppUrl =
        window.location.pathname + window.location.search;

      if (newFullAppUrl !== currentFullAppUrl) {
        window.history.replaceState(null, '', newFullAppUrl);
      }
    }
  }, [
    method,
    debouncedUrl,
    debouncedRequestBody,
    headers,
    pathname,
    requestBody,
    searchParams,
  ]);
}
