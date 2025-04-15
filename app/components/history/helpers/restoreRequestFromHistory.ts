import { AppDispatch } from '@/app/store/store';
import {
  setMethod,
  setUrl,
  setRequestBody,
  setBodyLanguage,
  setHeaders,
  setQueryParams,
  clearResponse,
} from '@/app/store/restClientSlice';
import { HistoryItem } from '@/app/interfaces';

export const restoreRequestFromHistory = async (
  searchParams: URLSearchParams,
  dispatch: AppDispatch
): Promise<HistoryItem | null> => {
  const restoreParam = searchParams.get('restore');
  const requestId = Array.isArray(restoreParam)
    ? restoreParam[0]
    : restoreParam;

  if (!requestId || typeof requestId !== 'string') {
    return null;
  }

  try {
    const historyStr = localStorage.getItem('requestsHistory') || '[]';
    const historyItems: HistoryItem[] = JSON.parse(historyStr);
    const requestData = historyItems.find((item) => item.id === requestId);
    if (!requestData) {
      return null;
    }

    dispatch(clearResponse());
    dispatch(setMethod(requestData.method));
    dispatch(setUrl(requestData.url));
    dispatch(setRequestBody(requestData.body || ''));
    dispatch(setBodyLanguage(requestData.bodyLanguage as 'json' | 'plaintext'));

    dispatch(
      setHeaders(
        requestData.headers?.map((h) => ({
          id: crypto.randomUUID(),
          key: h.key,
          value: h.value,
        })) || []
      )
    );

    dispatch(
      setQueryParams(
        requestData.queryParams?.map((p) => ({
          id: crypto.randomUUID(),
          key: p.key,
          value: p.value,
        })) || []
      )
    );

    return requestData;
  } catch {
    return null;
  }
};
