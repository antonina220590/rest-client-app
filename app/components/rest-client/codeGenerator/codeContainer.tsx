'use client';

import { useState } from 'react';
import LangSelector from './LangSelector';
import { Button } from '@/components/ui/button';
import { langs } from '@/app/interfaces';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import RequestBodyEditor from '../BodyEditor';
import { mapSelectedLangToCm } from '../helpers/langMapping';

export default function CodeContainer() {
  const [selectedLanguage, setSelectedLanguage] = useState(langs[0]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const codeMirrorLanguage = mapSelectedLangToCm(selectedLanguage);

  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    setGeneratedCode(`${newLang}`);
  };

  const handleCopy = () => {
    if (navigator.clipboard && generatedCode) {
      navigator.clipboard
        .writeText(generatedCode)
        .then(() => {
          toast('Code copied!');
        })
        .catch((err) => {
          toast(`Error: ${err} `, err);
        });
    }
  };
  return (
    <div className="h-full">
      <span> Code Generator</span>
      <div>
        <div className="flex-grow border rounded-md overflow-hidden min-h-[400px]">
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
              disabled={!generatedCode || generatedCode.startsWith('')}
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
