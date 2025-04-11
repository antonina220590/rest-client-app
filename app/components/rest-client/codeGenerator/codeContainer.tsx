'use client';

import { useEffect, useState } from 'react';
import LangSelector from './LangSelector';
import { Button } from '@/components/ui/button';
import { langs } from '@/app/interfaces';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import RequestBodyEditor from '../BodyEditor';
import { mapSelectedLangToCm } from '../helpers/langMapping';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { useTranslations } from 'next-intl';
import { interpolateVariables } from '../../variables/helpers/interpolate';

export default function CodeContainer() {
  const t = useTranslations('RESTful');
  const [selectedLanguage, setSelectedLanguage] = useState(langs[0]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const codeMirrorLanguage = mapSelectedLangToCm(selectedLanguage);
  const [isLoading, setIsLoading] = useState(false);

  const { method, url, headers, requestBody } = useSelector(
    (state: RootState) => ({
      method: state.restClient.method,
      url: state.restClient.url,
      headers: state.restClient.headers,
      requestBody: state.restClient.requestBody,
    }),
    shallowEqual
  );

  const variables = useSelector(
    (state: RootState) => state.variables,
    shallowEqual
  );

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
          headers: {
            'Content-Type': 'application/json',
          },
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
        toast.error(t('Code generation error'), {
          description: errorMessage,
        });
        setGeneratedCode(t('errorGeneration'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchGeneratedCode();
  }, [selectedLanguage, method, url, headers, requestBody, t, variables]);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
  };

  const handleCopy = () => {
    if (navigator.clipboard && generatedCode) {
      navigator.clipboard
        .writeText(generatedCode)
        .then(() => {
          toast(t('Code copied!'));
        })
        .catch((err) => {
          const errorMsg = err instanceof Error ? err.message : String(err);
          const errorPrefix = t('Error:');
          toast(`${errorPrefix} ${errorMsg}`);
        });
    }
  };

  return (
    <div className="h-full">
      <span className="flex mb-2">{t('Code Snippet')}</span>
      <div>
        <div className="flex-grow border rounded-md overflow-hidden min-h-[400px] bg-accent text-sm">
          <div className="flex justify-between mb-2">
            <LangSelector
              value={selectedLanguage}
              onChange={handleLanguageChange}
            />{' '}
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="icon"
              aria-label="Copy"
              className="px-3 py-1.5 border rounded bg-muted hover:bg-accent text-sm flex items-center justify-center gap-1.5"
              disabled={
                isLoading || !generatedCode || generatedCode.startsWith('//')
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <RequestBodyEditor
            value={generatedCode}
            language={codeMirrorLanguage}
            readOnly={true}
            showPrettifyButton={false}
            showLanguageSelector={false}
            contentEditable={false}
          />
        </div>
      </div>
    </div>
  );
}
