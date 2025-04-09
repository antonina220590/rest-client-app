import { useMemo } from 'react';
import { EditorState } from '@codemirror/state';
import { lineNumbers } from '@codemirror/view';
import { materialLight } from '@uiw/codemirror-theme-material';
import { json } from '@codemirror/lang-json';
import {
  defaultHighlightStyle,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { BodyLanguage } from '@/app/interfaces';

export const useCodeMirrorExtensions = (language: BodyLanguage) => {
  const extensions = useMemo(() => {
    const base = [
      materialLight,
      EditorState.tabSize.of(2),
      indentUnit.of('  '),
      lineNumbers(),
      closeBrackets(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    ];

    if (language === 'json') {
      return [...base, json()];
    }

    return base;
  }, [language]);

  return extensions;
};
