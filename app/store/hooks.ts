import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/interfaces';
import type { AppDispatch } from './store';
import { useEffect } from 'react';
import { addHistoryItem } from '../store/historySlice';
import { selectRestClient } from '../store/restClientSlice';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useRequestHistory = () => {
  const dispatch = useAppDispatch();
  const {
    responseStatus,
    isLoading,
    method,
    url,
    headers,
    queryParams,
    requestBody,
    bodyLanguage,
  } = useAppSelector(selectRestClient);

  useEffect(() => {
    if (responseStatus && !isLoading) {
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
    }
  }, [
    dispatch,
    responseStatus,
    isLoading,
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
