import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { RootState } from '@/app/store/store';

export function useRequestNotifications() {
  const error = useSelector((state: RootState) => state.restClient.error);
  const isLoading = useSelector(
    (state: RootState) => state.restClient.isLoading
  );
  const responseStatus = useSelector(
    (state: RootState) => state.restClient.responseStatus
  );

  const t = useTranslations('RESTful');

  const prevError = useRef<string | null>(null);
  const prevIsLoading = useRef<boolean>(false);

  useEffect(() => {
    if (error && error !== prevError.current) {
      toast.error(t('Request Failed'), { description: error });
    }

    if (
      prevIsLoading.current &&
      !isLoading &&
      !error &&
      responseStatus !== null &&
      responseStatus >= 200 &&
      responseStatus < 300
    ) {
      toast.success(t('Request successful!'));
    }
    prevError.current = error;
    prevIsLoading.current = isLoading;
  }, [error, isLoading, responseStatus, t]);
}
