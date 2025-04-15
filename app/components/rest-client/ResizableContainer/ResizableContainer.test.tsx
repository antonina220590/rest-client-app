import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, UnknownAction } from '@reduxjs/toolkit';

import type { Variable } from '@/app/store/types';
import type { RootState } from '@/app/store/store';
import type { UseResizableLayoutReturn } from '@/app/hooks/useResizableLayout';

import restClientReducer, {
  initialState as restClientInitialState,
} from '@/app/store/restClientSlice';
import variablesReducer, {
  initialState as variablesInitialState,
} from '@/app/store/variablesSlice';
import ResizableContainer from '@/app/components/rest-client/ResizableContainer/ResizableContainer';
import { RestClientState } from '@/app/interfaces';
vi.mock('@/app/components/rest-client/MethodSelector/MethodSelector', () => ({
  default: vi.fn(
    ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (newMethod: string) => void;
    }) => (
      <select
        data-testid="method-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
    )
  ),
}));
vi.mock('@/app/components/rest-client/UrlInput/UrlInput', () => ({
  default: vi.fn(
    ({
      value,
      onChange,
      onSend,
    }: {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onSend: () => void;
    }) => (
      <div>
        <input
          data-testid="url-input"
          type="text"
          value={value}
          onChange={onChange}
        />
        <button data-testid="send-button" onClick={onSend}>
          Send
        </button>
      </div>
    )
  ),
}));
vi.mock(
  '@/app/components/rest-client/RequestResponseArea/RequestResponseArea',
  () => ({
    RequestResponseArea: vi.fn(() => (
      <div data-testid="request-response-area">RequestResponseArea Mock</div>
    )),
  })
);
vi.mock('@/app/components/rest-client/codeGenerator/CodeContainer', () => ({
  default: vi.fn(() => (
    <div data-testid="code-container">CodeContainer Mock</div>
  )),
}));

let isCodePanelOpenMock = true;
const mockToggleCodePanel = vi.fn();
const mockSyncCodePanelState = vi.fn();
const mockLayoutGroupRef = { current: null };

vi.mock('@/app/hooks/useResizableLayout', () => ({
  useResizableLayout: vi.fn(
    (): UseResizableLayoutReturn => ({
      isPanelOpen: isCodePanelOpenMock,
      layoutGroupRef: mockLayoutGroupRef,
      togglePanel: mockToggleCodePanel,
      syncPanelState: mockSyncCodePanelState,
      OPEN_LAYOUT: [70, 30],
      CLOSED_LAYOUT: [100, 0],
    })
  ),
}));
vi.mock('@/app/hooks/useSyncUrlWithReduxState', () => ({
  useSyncUrlWithReduxState: vi.fn(),
}));
vi.mock('@/app/hooks/useRequestNotifications', () => ({
  useRequestNotifications: vi.fn(),
}));

const wrappedRestClientReducer = (
  state: RestClientState | undefined,
  action: UnknownAction
): RestClientState => {
  return restClientReducer(
    state === undefined ? restClientInitialState : state,
    action
  );
};
const wrappedVariablesReducer = (
  state: Variable[] | undefined,
  action: UnknownAction
): Variable[] => {
  return variablesReducer(
    state === undefined ? variablesInitialState : state,
    action
  );
};

const createTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      restClient: wrappedRestClientReducer,
      variables: wrappedVariablesReducer,
    },
    preloadedState: preloadedState,
  });
};

type TestStore = ReturnType<typeof createTestStore>;

const renderWithProvider = (
  ui: React.ReactElement,
  {
    store = createTestStore(),
    ...renderOptions
  }: { store?: TestStore } & import('@testing-library/react').RenderOptions = {}
) => {
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>, renderOptions),
  };
};

const originalLocation = window.location;

describe('ResizableContainer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isCodePanelOpenMock = true;

    const mockPathname = '/en/GET/aHR0cHM6Ly9leGFtcGxlLmNvbQ==';
    const mockSearch = '?Content-Type=application%2Fjson';
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: mockPathname,
        search: mockSearch,
        origin: 'http://localhost:3000',
        href: `http://localhost:3000${mockPathname}${mockSearch}`,
        assign: vi.fn(),
        reload: vi.fn(),
        replace: vi.fn(),
        toString: vi.fn(() => window.location.href),
        ancestorOrigins: [] as unknown as DOMStringList,
        hash: '',
        host: 'localhost:3000',
        hostname: 'localhost',
        port: '3000',
        protocol: 'http:',
        searchParams: new URLSearchParams(mockSearch),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  it('should render main layout elements correctly', () => {
    renderWithProvider(<ResizableContainer />);
    expect(
      screen.getByRole('button', { name: /toggle code panel/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('method-selector')).toBeInTheDocument();
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
    expect(screen.getByTestId('request-response-area')).toBeInTheDocument();
    expect(screen.getByTestId('code-container')).toBeInTheDocument();
  });

  it('should initialize Redux state based on window.location on mount', () => {
    const testLocale = 'fr';
    const testMethod = 'POST';
    const testTargetUrl = 'https://test.com/api/v1/users';
    const testBody = JSON.stringify({ name: 'Test User', role: 'tester' });
    const testHeaderKey = 'Authorization';
    const testHeaderValue = 'Bearer secret-token';

    const encodedUrl = btoa(testTargetUrl)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const encodedBody = btoa(testBody)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const encodedHeaderValue = encodeURIComponent(testHeaderValue);

    const testPathname = `/${testLocale}/${testMethod}/${encodedUrl}/${encodedBody}`;
    const testSearch = `?${testHeaderKey}=${encodedHeaderValue}`;

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...window.location,
        pathname: testPathname,
        search: testSearch,
        searchParams: new URLSearchParams(testSearch),
      },
    });

    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithProvider(<ResizableContainer />, { store });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/setMethod',
        payload: testMethod,
      })
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/setUrl',
        payload: testTargetUrl,
      })
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/setRequestBody',
        payload: testBody,
      })
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/setHeaders',
        payload: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            key: testHeaderKey,
            value: testHeaderValue,
          }),
        ]),
      })
    );
    const setHeadersAction = dispatchSpy.mock.calls.find(
      (call) => call[0]?.type === 'restClient/setHeaders'
    )?.[0];
    expect(setHeadersAction).toBeDefined();
    expect(
      (setHeadersAction as unknown as { payload: unknown[] })?.payload
    ).toHaveLength(1);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/setBodyLanguage',
        payload: 'json',
      })
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/clearResponse',
      })
    );
  });
  it('should dispatch setMethod action when MethodSelector value changes', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithProvider(<ResizableContainer />, { store });
    const methodSelector = screen.getByTestId('method-selector');
    fireEvent.change(methodSelector, { target: { value: 'POST' } });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/setMethod',
        payload: 'POST',
      })
    );
  });
  it('should dispatch setUrl action when UrlInput value changes', () => {
    const store = createTestStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithProvider(<ResizableContainer />, { store });
    const urlInput = screen.getByTestId('url-input');
    const testUrl = 'https://my-test-api.dev/users';
    fireEvent.change(urlInput, { target: { value: testUrl } });
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'restClient/setUrl',
        payload: testUrl,
      })
    );
  });
  it('should dispatch sendRequest thunk when Send button is clicked', () => {
    const preloadedState: Partial<RootState> = {
      restClient: {
        ...restClientInitialState,
        method: 'POST',
        url: 'https://api.test.com/data',
        requestBody: '{"message": "hello"}',
        headers: [{ id: 'h1', key: 'X-Test', value: 'true' }],
        queryParams: [{ id: 'q1', key: 'id', value: '123' }],
      },
      variables: [],
    };

    const store = createTestStore(preloadedState);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    renderWithProvider(<ResizableContainer />, { store });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should call togglePanel from useResizableLayout when toggle button is clicked', () => {
    renderWithProvider(<ResizableContainer />);
    const toggleButton = screen.getByRole('button', {
      name: /toggle code panel/i,
    });

    fireEvent.click(toggleButton);
    expect(mockToggleCodePanel).toHaveBeenCalledTimes(1);
    fireEvent.click(toggleButton);
    expect(mockToggleCodePanel).toHaveBeenCalledTimes(2);
  });

  it('should render CodeContainer only when isPanelOpen from useResizableLayout is true', () => {
    isCodePanelOpenMock = true;
    const { unmount } = renderWithProvider(<ResizableContainer />);
    expect(screen.getByTestId('code-container')).toBeInTheDocument();
    unmount();
    isCodePanelOpenMock = false;
    renderWithProvider(<ResizableContainer />);
    expect(screen.queryByTestId('code-container')).not.toBeInTheDocument();
  });
});
