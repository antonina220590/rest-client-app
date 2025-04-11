'use client';

import React, { useCallback, useMemo } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';

import { Button } from '@/components/ui/button';
import { WandSparkles, Braces, Type } from 'lucide-react';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import { BodyLanguage, RequestBodyEditorProps } from '@/app/interfaces';
import { prettifyJsonInput } from './helpers/prettifier';
import { useCodeMirrorExtensions } from '@/app/hooks/useCodeMirrorExtensions';

export default function RequestBodyEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
  showPrettifyButton = true,
  showLanguageSelector = true,
  contentEditable,
  lineWrapping = false,
}: RequestBodyEditorProps) {
  const baseExtensions = useCodeMirrorExtensions(language);

  const extensions = useMemo(() => {
    const exts = [...baseExtensions];
    if (lineWrapping) {
      exts.push(EditorView.lineWrapping);
    }
    return exts;
  }, [baseExtensions, lineWrapping]);

  const handleEditorChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const t = useTranslations('RESTful');

  const handlePrettify = useCallback(() => {
    if (!onChange || language !== 'json') {
      if (language !== 'json') {
        toast.info(t('Prettify is only available for JSON'));
      }
      return;
    }
    prettifyJsonInput({
      value,
      language,
      readOnly,
      onChange,
      toast,
      t,
    });
  }, [value, language, readOnly, onChange, t]);

  const handleLangChange = (value: BodyLanguage) => {
    if (value && onLanguageChange) {
      onLanguageChange(value);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {!readOnly && (showLanguageSelector || showPrettifyButton) && (
        <div className="flex justify-start items-center p-2 gap-2 border-b h-fit min-h-[30px] w-full">
          {showLanguageSelector && onLanguageChange && (
            <TooltipProvider delayDuration={100}>
              <ToggleGroup
                type="single"
                size="sm"
                value={language}
                onValueChange={handleLangChange}
                aria-label="Select Body Language"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="json"
                      aria-label="JSON"
                      className="h-6 px-1 aria-checked:bg-accent aria-checked:text-accent-foreground"
                    >
                      <Braces className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    {' '}
                    <p>JSON</p>{' '}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="plaintext"
                      aria-label="Plain Text"
                      className="h-6 px-1 aria-checked:bg-accent aria-checked:text-accent-foreground"
                    >
                      <Type className="h-4 w-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    {' '}
                    <p>{t('text')}</p>{' '}
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            </TooltipProvider>
          )}
          {showPrettifyButton && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrettify}
                    disabled={language !== 'json'}
                    className="h-6 w-6 p-0"
                    aria-label="Prettify JSON"
                  >
                    <WandSparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('prettify')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      <div className="flex-grow w-[100%]">
        <CodeMirror
          value={value}
          onChange={handleEditorChange}
          extensions={extensions}
          readOnly={readOnly}
          contentEditable={contentEditable}
          height="100%"
          basicSetup={{
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            lineNumbers: true,
          }}
        />
      </div>
    </div>
  );
}
