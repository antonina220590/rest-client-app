'use client';

import React, { useCallback, useMemo } from 'react';
import CodeMirror, { EditorState, lineNumbers } from '@uiw/react-codemirror';
import { materialLight } from '@uiw/codemirror-theme-material';
import { json } from '@codemirror/lang-json';
import { Button } from '@/components/ui/button';
import { WandSparkles, Braces, Type } from 'lucide-react';
import JSON5 from 'json5';
import { toast } from 'sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  defaultHighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';

export type BodyLanguage = 'json' | 'plaintext';
interface RequestBodyEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: BodyLanguage;
  readOnly?: boolean;

  onLanguageChange?: (language: BodyLanguage) => void;
  showPrettifyButton?: boolean;
  showLanguageSelector?: boolean;

  contentEditable: boolean;
}

export default function RequestBodyEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
  showPrettifyButton = true,
  showLanguageSelector = true,
  contentEditable,
}: RequestBodyEditorProps) {
  const handleEditorChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handlePrettify = () => {
    if (language !== 'json' || readOnly) return;
    let parsedData: unknown = null;

    try {
      parsedData = JSON.parse(value);
    } catch {
      try {
        parsedData = JSON5.parse(value);
      } catch (errorJson5) {
        toast.error('Invalid Syntax', {
          description:
            errorJson5 instanceof Error
              ? errorJson5.message
              : 'Cannot parse JSON/JSON5.',
        });
        return;
      }
    }
    if (parsedData !== null) {
      try {
        const pretty = JSON.stringify(parsedData, null, 2);
        if (pretty !== value && onChange) {
          onChange(pretty);
          toast.success('JSON prettified successfully.');
        } else if (pretty === value) {
          toast.info('JSON is already prettified or no changes were made.');
        }
      } catch (stringifyError) {
        toast.error('Error formatting data', {
          description:
            stringifyError instanceof Error
              ? stringifyError.message
              : undefined,
        });
      }
    }
  };

  const extensions = useMemo(() => {
    const base = [
      materialLight,
      EditorState.tabSize.of(1),
      indentUnit.of(' '),
      lineNumbers(),
      closeBrackets(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    ];

    if (language === 'json') {
      return [...base, json()];
    }
    return base;
  }, [language]);

  const handleLangChange = (value: BodyLanguage) => {
    if (value && onLanguageChange) {
      onLanguageChange(value);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {!readOnly && (showLanguageSelector || showPrettifyButton) && (
        <div className="flex justify-end items-center p-2 gap-2 border-b h-fit min-h-[30px] w-[90%]">
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
                    <p>Plain Text</p>{' '}
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
                  <p>Prettify JSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      <div className="flex-grow w-[90%]">
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
