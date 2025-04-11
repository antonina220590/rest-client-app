'use client';

import { useState, useEffect } from 'react';
import { interpolateVariables } from '../components/variables/helpers/interpolate';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { UseGeneratedCodeProps, UseGeneratedCodeReturn } from '../interfaces';

export function useGeneratedCode({
  selectedLanguage,
  method,
  url,
  headers,
  requestBody,
  variables,
}: UseGeneratedCodeProps): UseGeneratedCodeReturn {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('RESTful');

  useEffect(() => {
    if (!url) {
      setGeneratedCode(t('providingURL'));
      setIsLoading(false);
      return;
    }

    const fetchGeneratedCode = async () => {
      setIsLoading(true);

      setGeneratedCode(t('generatingCodeFor', { language: selectedLanguage }));

      let substitutedUrl = url;
      let substitutedBody = requestBody;
      let substitutedHeaders = headers;

      try {
        const currentVariables = Array.isArray(variables) ? variables : [];
        substitutedUrl = interpolateVariables(url, currentVariables);
        substitutedBody = interpolateVariables(requestBody, currentVariables);
        substitutedHeaders = headers.map((header) => ({
          ...header,
          value: interpolateVariables(header.value, currentVariables),
        }));
      } catch (substError) {
        const errorDetails =
          substError instanceof Error ? substError.message : String(substError);
        setGeneratedCode(t('variablesErrorDetails', { details: errorDetails }));
        setIsLoading(false);
        return;
      }

      const payload = {
        selectedLanguage,
        method,
        url: substitutedUrl,
        headers: substitutedHeaders,
        requestBody: substitutedBody,
      };

      try {
        const response = await fetch('/api/generate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorDetails = `HTTP error! Status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.details || errorDetails;
          } catch {
            errorDetails = response.statusText || errorDetails;
          }
          throw new Error(errorDetails);
        }

        const data = await response.json();
        if (data.code !== undefined && data.code !== null) {
          setGeneratedCode(data.code);
        } else {
          throw new Error(t('The API returned an empty code snippet'));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error(t('Code generation error'), { description: errorMessage });
        setGeneratedCode(t('errorGeneration'));
      } finally {
        setIsLoading(false);
      }
    };
    const timerId = setTimeout(() => {
      fetchGeneratedCode();
    }, 300);
    return () => clearTimeout(timerId);
  }, [selectedLanguage, method, url, headers, requestBody, variables, t]);

  return { generatedCode, isLoading };
}
