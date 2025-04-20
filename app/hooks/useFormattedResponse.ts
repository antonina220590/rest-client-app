import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '@/app/store/store';
import type { BodyLanguage } from '@/app/interfaces';

export interface FormattedResponse {
  displayValue: string;
  displayLanguage: BodyLanguage;
}

export default function useFormattedResponse(): FormattedResponse {
  const responseData = useSelector(
    (state: RootState) => state.restClient.responseData
  );
  const responseContentType = useSelector(
    (state: RootState) => state.restClient.responseContentType
  );
  const responseStatus = useSelector(
    (state: RootState) => state.restClient.responseStatus
  );
  const isLoading = useSelector(
    (state: RootState) => state.restClient.isLoading
  );

  const formattedResponse = useMemo<FormattedResponse>(() => {
    if (isLoading) {
      return { displayValue: '', displayLanguage: 'plaintext' };
    }

    if (responseData !== null && responseData !== undefined) {
      const isErrorStatus = responseStatus !== null && responseStatus >= 400;

      if (isErrorStatus) {
        if (responseStatus === 404) {
          return {
            displayValue: '404 Not Found',
            displayLanguage: 'plaintext',
          };
        }
        try {
          const parsedError = JSON.parse(responseData);
          if (
            typeof parsedError === 'object' &&
            parsedError !== null &&
            typeof parsedError.error === 'string'
          ) {
            return {
              displayValue: parsedError.error,
              displayLanguage: 'plaintext',
            };
          }
        } catch {}
        return { displayValue: responseData, displayLanguage: 'plaintext' };
      }
      const isJson = responseContentType
        ?.toLowerCase()
        .includes('application/json');
      if (isJson) {
        try {
          const parsed = JSON.parse(responseData);
          const pretty = JSON.stringify(parsed, null, 2);
          return { displayValue: pretty, displayLanguage: 'json' };
        } catch (e) {
          toast.error(
            `Response JSON parse error: ${e instanceof Error ? e.message : String(e)}`
          );
          return { displayValue: responseData, displayLanguage: 'plaintext' };
        }
      } else {
        return { displayValue: responseData, displayLanguage: 'plaintext' };
      }
    }

    return { displayValue: '', displayLanguage: 'plaintext' };
  }, [responseData, responseContentType, responseStatus, isLoading]);

  return formattedResponse;
}
