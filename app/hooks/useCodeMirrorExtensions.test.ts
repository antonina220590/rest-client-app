import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCodeMirrorExtensions } from '@/app/hooks/useCodeMirrorExtensions';

vi.mock('@codemirror/lang-json', () => ({
  json: vi.fn(() => 'mocked_json_extension'),
}));
vi.mock('@codemirror/lang-javascript', () => ({
  javascript: vi.fn(() => 'mocked_javascript_extension'),
}));
vi.mock('@codemirror/lang-python', () => ({
  python: vi.fn(() => 'mocked_python_extension'),
}));
vi.mock('@codemirror/lang-java', () => ({
  java: vi.fn(() => 'mocked_java_extension'),
}));
vi.mock('@codemirror/lang-cpp', () => ({
  cpp: vi.fn(() => 'mocked_cpp_extension'),
}));
vi.mock('@codemirror/lang-go', () => ({
  go: vi.fn(() => 'mocked_go_extension'),
}));
vi.mock('@codemirror/legacy-modes/mode/shell', () => ({
  shell: { name: 'mocked_shell_mode' },
}));

vi.mock('@codemirror/language', () => ({
  StreamLanguage: { define: vi.fn(() => 'mocked_stream_language_shell') },

  syntaxHighlighting: vi.fn(() => 'mocked_syntax_highlighting'),

  defaultHighlightStyle: 'mocked_default_highlight',
  indentUnit: { of: vi.fn(() => 'mocked_indent_unit') },
}));

vi.mock('@codemirror/state', () => ({
  EditorState: { tabSize: { of: vi.fn(() => 'mocked_tab_size') } },
}));
vi.mock('@codemirror/view', () => ({
  lineNumbers: vi.fn(() => 'mocked_line_numbers'),
}));

vi.mock('@uiw/codemirror-theme-material', () => ({
  materialLight: 'mocked_material_light',
}));

vi.mock('@codemirror/autocomplete', () => ({
  closeBrackets: vi.fn(() => 'mocked_close_brackets'),
}));

type AcceptedLanguage =
  | 'json'
  | 'plaintext'
  | 'shell'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go';

describe('useCodeMirrorExtensions Hook', () => {
  const BASE_EXTENSIONS_COUNT = 6;
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include the mocked json extension for "json" language', () => {
    const languageInput: AcceptedLanguage = 'json';

    const { result } = renderHook(() => useCodeMirrorExtensions(languageInput));
    const extensions = result.current;

    expect(extensions).toContain('mocked_json_extension');
    expect(extensions).not.toContain('mocked_javascript_extension');
    expect(extensions).toContain('mocked_material_light');
    expect(extensions).toContain('mocked_line_numbers');
    expect(extensions).toContain('mocked_tab_size');
    expect(extensions).toContain('mocked_indent_unit');
    expect(extensions).toContain('mocked_close_brackets');
    expect(extensions).toContain('mocked_syntax_highlighting');
    expect(extensions).toHaveLength(6 + 1);
  });

  it('should include the mocked javascript extension for "javascript" language', () => {
    const languageInput: AcceptedLanguage = 'javascript';

    const { result } = renderHook(() => useCodeMirrorExtensions(languageInput));
    const extensions = result.current;

    expect(extensions).toContain('mocked_javascript_extension');

    expect(extensions).not.toContain('mocked_json_extension');
    expect(extensions).not.toContain('mocked_python_extension');

    expect(extensions).toContain('mocked_material_light');
    expect(extensions).toContain('mocked_line_numbers');
    expect(extensions).toHaveLength(BASE_EXTENSIONS_COUNT + 1);
  });
  it('should include the mocked python extension for "python" language', () => {
    const { result } = renderHook(() => useCodeMirrorExtensions('python'));
    expect(result.current).toContain('mocked_python_extension');
    expect(result.current).toHaveLength(BASE_EXTENSIONS_COUNT + 1);
    expect(result.current).toContain('mocked_material_light');
  });
  it('should include the mocked cpp extension for "csharp" language', () => {
    const { result } = renderHook(() => useCodeMirrorExtensions('csharp'));
    expect(result.current).toContain('mocked_cpp_extension');
    expect(result.current).toHaveLength(BASE_EXTENSIONS_COUNT + 1);
    expect(result.current).toContain('mocked_material_light');
  });
  it('should include the mocked shell extension for "shell" language', () => {
    const { result } = renderHook(() => useCodeMirrorExtensions('shell'));
    expect(result.current).toContain('mocked_stream_language_shell');
    expect(result.current).toHaveLength(BASE_EXTENSIONS_COUNT + 1);
    expect(result.current).toContain('mocked_material_light');
  });
  it('should return only base extensions for "plaintext" language', () => {
    const languageInput: AcceptedLanguage = 'plaintext';

    const { result } = renderHook(() => useCodeMirrorExtensions(languageInput));
    const extensions = result.current;

    expect(extensions).toHaveLength(BASE_EXTENSIONS_COUNT);
    expect(extensions).not.toContain('mocked_json_extension');
    expect(extensions).not.toContain('mocked_javascript_extension');
    expect(extensions).not.toContain('mocked_python_extension');
    expect(extensions).not.toContain('mocked_java_extension');
    expect(extensions).not.toContain('mocked_cpp_extension');
    expect(extensions).not.toContain('mocked_go_extension');
    expect(extensions).not.toContain('mocked_stream_language_shell');

    expect(extensions).toContain('mocked_material_light');
    expect(extensions).toContain('mocked_line_numbers');
  });
  it('should return only base extensions for an unknown language input', () => {
    const languageInput = 'ruby' as AcceptedLanguage;
    const { result } = renderHook(() => useCodeMirrorExtensions(languageInput));
    const extensions = result.current;

    expect(extensions).toHaveLength(BASE_EXTENSIONS_COUNT);
    expect(extensions).not.toContain('mocked_json_extension');
    expect(extensions).toContain('mocked_material_light');
  });
});
