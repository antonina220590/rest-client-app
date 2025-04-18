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
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { closeBrackets } from '@codemirror/autocomplete';

type AcceptedLanguage =
  | 'json'
  | 'plaintext'
  | 'shell'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'plaintext'
  | 'shell';

export const useCodeMirrorExtensions = (language: AcceptedLanguage) => {
  const extensions = useMemo(() => {
    const base = [
      materialLight,
      EditorState.tabSize.of(2),
      indentUnit.of('  '),
      lineNumbers(),
      closeBrackets(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    ];

    switch (language) {
      case 'json':
        return [...base, json()];
      case 'javascript':
        return [...base, javascript()];
      case 'python':
        return [...base, python()];
      case 'java':
        return [...base, java()];
      case 'csharp':
        return [...base, cpp()];
      case 'go':
        return [...base, go()];
      case 'shell':
        return [...base, StreamLanguage.define(shell)];
      case 'plaintext':
      default:
        return base;
    }
  }, [language]);

  return extensions;
};
