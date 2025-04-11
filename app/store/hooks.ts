import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useCallback, useRef } from 'react';
import type { RootState } from '@/app/interfaces';
import type { AppDispatch } from './store';
import { useEffect } from 'react';
import { addHistoryItem } from '../store/historySlice';
import { selectRestClient } from '../store/restClientSlice';
import { clearHistory } from './historySlice';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useRequestHistory = () => {
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
  ]);
};

export const useHistoryItems = () => {
  return useAppSelector((state) =>
    [...state.history.items].sort((a, b) => b.timestamp - a.timestamp)
  );
};

export const useClearHistory = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(clearHistory()), [dispatch]);
};
