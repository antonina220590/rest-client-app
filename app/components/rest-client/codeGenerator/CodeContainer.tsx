'use client';

import { useState } from 'react';
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
import { useDebounce } from '@/app/hooks/useDebounce';
import { useGeneratedCode } from '@/app/hooks/useGeneratedCode';

export default function CodeContainer() {
  const t = useTranslations('RESTful');
  const [selectedLanguage, setSelectedLanguage] = useState(langs[0]);

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

  const debouncedUrl = useDebounce(url, 500);
  const debouncedRequestBody = useDebounce(requestBody, 500);

  const { generatedCode, isLoading } = useGeneratedCode({
    selectedLanguage,
    method,
    url: debouncedUrl,
    requestBody: debouncedRequestBody,
    headers,
    variables,
  });

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

  const codeMirrorLanguage = mapSelectedLangToCm(selectedLanguage);

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
            lineWrapping={true}
          />
        </div>
      </div>
    </div>
  );
}
