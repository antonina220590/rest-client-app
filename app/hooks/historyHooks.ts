import { useCallback, useRef, useEffect } from 'react';
import type { HistoryItem } from '@/app/interfaces';
import {
  addHistoryItem,
  removeRepeatedHistoryItem,
  deleteHistoryItem,
  clearHistory,
  selectSortedHistoryItems,
} from '../store/historySlice';
import { selectRestClient } from '../store/restClientSlice';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';

export const useNotFullHistory = false;

export const useRequestHistory = (historyItems: HistoryItem[]) => {
  const dispatch = useAppDispatch();
  const { responseStatus, isLoading } = useAppSelector(selectRestClient);
  const { method, url, headers, queryParams, requestBody, bodyLanguage } =
    useAppSelector((state) => state.restClient);

  const stateRef = useRef({
    lastAddedStatus: null as number | null,
    isRequestInProgress: false,
  });

  useEffect(() => {
    if (isLoading) {
      stateRef.current.isRequestInProgress = true;
      stateRef.current.lastAddedStatus = null;
    } else if (stateRef.current.isRequestInProgress) {
      stateRef.current.isRequestInProgress = false;

      if (
        responseStatus !== null &&
        responseStatus !== undefined &&
        responseStatus >= 200 &&
        responseStatus < 300
      ) {
        if (useNotFullHistory) {
          historyItems.forEach((item) => {
            const isMatch =
              item.method === method &&
              item.url === url &&
              JSON.stringify(item.headers) === JSON.stringify(headers) &&
              JSON.stringify(item.queryParams) ===
                JSON.stringify(queryParams) &&
              item.body === requestBody &&
              item.bodyLanguage === bodyLanguage;

            if (isMatch) {
              dispatch(removeRepeatedHistoryItem(item.id));
            }
          });
        }
        if (responseStatus !== stateRef.current.lastAddedStatus) {
          dispatch(
            addHistoryItem({
              method,
              url,
              headers: headers.filter((h) => h.key),
              queryParams: queryParams.filter((p) => p.key),
              body: requestBody,
              bodyLanguage,
            })
          );
          stateRef.current.lastAddedStatus = responseStatus;
        }
      }
    }
  }, [
    isLoading,
    responseStatus,
    dispatch,
    method,
    url,
    headers,
    queryParams,
    requestBody,
    bodyLanguage,
    historyItems,
  ]);
};

export const useHistoryItems = () => {
  return useAppSelector(selectSortedHistoryItems);
};

export const useClearHistory = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(clearHistory()), [dispatch]);
};

export const useDeleteHistoryItem = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (id: string) => dispatch(deleteHistoryItem(id)),
    [dispatch]
  );
};
