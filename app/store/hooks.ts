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
  const { responseStatus } = useAppSelector(selectRestClient);
  const { method, url, headers, queryParams, requestBody, bodyLanguage } =
    useAppSelector((state) => state.restClient);

  useEffect(() => {
    if (responseStatus) {
      // Если есть статус ответа (запрос выполнен)
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
