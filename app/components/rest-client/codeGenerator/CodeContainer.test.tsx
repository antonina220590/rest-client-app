import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, UnknownAction } from '@reduxjs/toolkit';

import type { RootState } from '@/app/store/store';
import type {
  RestClientState,
  LangProps,
  RequestBodyEditorProps,
  Variable,
  HistoryState,
} from '@/app/interfaces';
import type { UseGeneratedCodeReturn } from '@/app/interfaces';

import restClientReducer, {
  initialState as restClientInitialState,
} from '@/app/store/restClientSlice';
import variablesReducer, {
  initialState as variablesInitialState,
} from '@/app/store/variablesSlice';
import historyReducer, {
  initialState as historyInitialState,
} from '@/app/store/historySlice';

import CodeContainer from '@/app/components/rest-client/codeGenerator/CodeContainer';

import { useGeneratedCode } from '@/app/hooks/useGeneratedCode';
import userEvent from '@testing-library/user-event';

vi.mock('./LangSelector', () => ({
  default: vi.fn(({ value, onChange }: LangProps) => (
    <select
      data-testid="lang-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {' '}
      <option value="JavaScript - Fetch">JavaScript - Fetch</option>{' '}
      <option value="curl">curl</option>{' '}
    </select>
  )),
}));
vi.mock('../BodyEditor/BodyEditor', () => ({
  default: vi.fn(({ value, language }: RequestBodyEditorProps) => (
    <pre data-testid="code-editor" data-language={language}>
      {' '}
      {value}{' '}
    </pre>
  )),
}));

const { mockGeneratedCodeCtrl, mockIsLoadingCtrl } = vi.hoisted(() => {
  return {
    mockGeneratedCodeCtrl: { value: 'Default Hoisted Code' },
    mockIsLoadingCtrl: { value: false },
  };
});

const { mockTFn } = vi.hoisted(() => ({
  mockTFn: vi.fn((key: string) => key),
}));
const { mockToastFn } = vi.hoisted(() => ({ mockToastFn: vi.fn() }));

vi.mock('@/app/hooks/useGeneratedCode', () => ({
  useGeneratedCode: vi.fn(
    (): UseGeneratedCodeReturn => ({
      generatedCode: mockGeneratedCodeCtrl.value,
      isLoading: mockIsLoadingCtrl.value,
    })
  ),
}));

vi.mock('@/app/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => mockTFn,
}));

vi.mock('sonner', () => ({
  toast: mockToastFn,
}));

const wrappedRestClientReducer = (
  state: RestClientState | undefined,
  action: UnknownAction
): RestClientState =>
  restClientReducer(state ?? restClientInitialState, action);
const wrappedVariablesReducer = (
  state: Variable[] | undefined,
  action: UnknownAction
): Variable[] => variablesReducer(state ?? variablesInitialState, action);
const wrappedHistoryReducer = (
  state: HistoryState | undefined,
  action: UnknownAction
): HistoryState => historyReducer(state ?? historyInitialState, action);
const createTestStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: {
      restClient: wrappedRestClientReducer,
      variables: wrappedVariablesReducer,
      history: wrappedHistoryReducer,
    },
    preloadedState: preloadedState,
  });
type TestStore = ReturnType<typeof createTestStore>;
const renderWithProvider = (
  ui: React.ReactElement,
  {
    store = createTestStore(),
    ...renderOptions
  }: { store?: TestStore } & import('@testing-library/react').RenderOptions = {}
) => ({
  store,
  ...render(<Provider store={store}>{ui}</Provider>, renderOptions),
});

const mockWriteText = vi.fn();
let originalClipboard: typeof navigator.clipboard | undefined;

beforeEach(() => {
  vi.clearAllMocks();
  (useGeneratedCode as Mock).mockClear();
  mockGeneratedCodeCtrl.value = 'Default Code After Reset';
  mockIsLoadingCtrl.value = false;
  mockTFn.mockClear().mockImplementation((key: string) => key);
  mockToastFn.mockClear();

  originalClipboard = navigator.clipboard;
  const mockClipboard = {
    writeText: mockWriteText,
  };
  mockWriteText.mockClear().mockResolvedValue(undefined);
  Object.defineProperty(window.navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: originalClipboard,
    writable: true,
    configurable: true,
  });
});
describe('CodeContainer Component', () => {
  it('should render title, language selector, copy button, and code editor with initial code', () => {
    const store = createTestStore();
    renderWithProvider(<CodeContainer />, { store });

    expect(screen.getByText('Code Snippet')).toBeInTheDocument();
    expect(mockTFn).toHaveBeenCalledWith('Code Snippet');
    expect(screen.getByTestId('lang-selector')).toBeInTheDocument();
    expect(screen.getByTestId('lang-selector')).toHaveValue(
      'JavaScript - Fetch'
    );
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    const codeEditor = screen.getByTestId('code-editor');
    expect(codeEditor).toBeInTheDocument();

    expect(codeEditor).toHaveTextContent(mockGeneratedCodeCtrl.value);
    expect(codeEditor).toHaveAttribute('data-language', 'javascript');
    expect(screen.getByRole('button', { name: /copy/i })).toBeEnabled();
  });

  it('should display the generated code from useGeneratedCode hook', () => {
    const testCodeSnippet = 'fetch("https://api.example.com/items");';
    mockGeneratedCodeCtrl.value = testCodeSnippet;
    mockIsLoadingCtrl.value = false;

    const store = createTestStore();
    renderWithProvider(<CodeContainer />, { store });
    const codeEditor = screen.getByTestId('code-editor');
    expect(codeEditor).toHaveTextContent(testCodeSnippet);
  });

  it('should update language, re-trigger code generation, and update editor language prop on language change', () => {
    const store = createTestStore();
    renderWithProvider(<CodeContainer />, { store });
    const langSelector = screen.getByTestId('lang-selector');

    expect(useGeneratedCode).toHaveBeenCalledTimes(1);
    expect(useGeneratedCode).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedLanguage: 'JavaScript - Fetch',
      })
    );
    fireEvent.change(langSelector, { target: { value: 'curl' } });

    expect(langSelector).toHaveValue('curl');

    expect(useGeneratedCode).toHaveBeenCalledTimes(2);
    expect(useGeneratedCode).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedLanguage: 'curl',
        method: restClientInitialState.method,
        url: restClientInitialState.url,
        headers: restClientInitialState.headers,
        requestBody: restClientInitialState.requestBody,
        variables: variablesInitialState,
      })
    );
    expect(screen.getByTestId('code-editor')).toHaveAttribute(
      'data-language',
      'shell'
    );
  });

  it('should call toast when copy button is clicked and clipboard mock resolves', async () => {
    const user = userEvent.setup();
    const testCodeSnippet = 'console.log("Check Toast Call!");';
    mockGeneratedCodeCtrl.value = testCodeSnippet;
    mockIsLoadingCtrl.value = false;
    mockTFn.mockImplementation((key: string) => {
      if (key === 'Code copied!') return 'Code copied successfully!';
      return key;
    });

    const store = createTestStore();
    renderWithProvider(<CodeContainer />, { store });
    const copyButton = screen.getByRole('button', { name: /copy/i });
    const codeEditor = screen.getByTestId('code-editor');

    await waitFor(() => {
      expect(codeEditor).toHaveTextContent(testCodeSnippet);
    });
    expect(copyButton).toBeEnabled();
    await user.click(copyButton);
    await waitFor(() => {
      expect(mockToastFn).toHaveBeenCalledTimes(1);
    });
    expect(mockToastFn).toHaveBeenCalledWith('Code copied successfully!');
  });
});
