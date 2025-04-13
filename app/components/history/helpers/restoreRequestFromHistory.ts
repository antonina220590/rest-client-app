import { AppDispatch } from '@/app/store/store';
import {
  setMethod,
  setUrl,
  setRequestBody,
  setBodyLanguage,
  setHeaders,
  setQueryParams,
} from '@/app/store/restClientSlice';
import { HistoryItem } from '@/app/interfaces';

export const restoreRequestFromHistory = (
  searchParams: URLSearchParams,
  dispatch: AppDispatch
) => {
  const requestId = searchParams.get('restore');
  if (!requestId) return;

  try {
    const savedRequests = localStorage.getItem('savedRequests');
    if (!savedRequests) return;

    const requests: Record<string, Omit<HistoryItem, 'id'>> = JSON.parse(
      savedRequests
    );
    const requestData = requests[requestId];
    if (!requestData) return;

    dispatch(setMethod(requestData.method));
    dispatch(setUrl(requestData.url));
    dispatch(setRequestBody(requestData.body || ''));
    dispatch(setBodyLanguage(requestData.bodyLanguage as 'json' | 'plaintext'));

    dispatch(
      setHeaders(
        requestData.headers.map((h) => ({
          id: crypto.randomUUID(),
          key: h.key,
          value: h.value,
        })) || []
      )
    );

    dispatch(
      setQueryParams(
        requestData.queryParams.map((p) => ({
          id: crypto.randomUUID(),
          key: p.key,
          value: p.value,
        })) || []
      )
    );

    searchParams.delete('restore');
    window.history.replaceState(null, '', `?${searchParams.toString()}`);
  } catch {}
};
