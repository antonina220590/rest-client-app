import React from 'react';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import type {
  RestClientState,
  KeyValueItem,
  ResizableContainerProps,
  URLInputProps,
  RootState,
  SendRequestPayload,
} from '@/app/interfaces';
import MethodSelector from '../MethodSelector/MethodSelector';

const mockToastError = vi.fn();
const mockUseSelector = vi.fn();
const mockDecodeFromBase64Url = vi.fn();
const hoistedMockSendRequest = vi.hoisted(() =>
  vi.fn(() => ({ type: 'restClient/sendRequest/mocked' }))
);
const mockToggleCodePanel = vi.fn();
const mockSyncCodePanelState = vi.fn();
const mockUseRequestHistory = vi.fn();

vi.doMock('sonner', () => ({
  toast: { error: mockToastError, success: vi.fn(), info: vi.fn() },
}));

vi.doMock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return { ...actual, useSelector: mockUseSelector };
});

vi.doMock('../helpers/encoding', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers/encoding')>();
  return { ...actual, decodeFromBase64Url: mockDecodeFromBase64Url };
});

vi.doMock('@/app/hooks/useResizableLayout', () => ({
  useResizableLayout: vi.fn(() => ({
    isPanelOpen: false,
    layoutGroupRef: { current: null },
    togglePanel: mockToggleCodePanel,
    syncPanelState: mockSyncCodePanelState,
    OPEN_LAYOUT: [70, 30],
    CLOSED_LAYOUT: [100, 0],
  })),
}));
vi.doMock('@/app/hooks/useSyncUrlWithReduxState', () => ({
  useSyncUrlWithReduxState: vi.fn(),
}));
vi.doMock('@/app/hooks/useRequestNotifications', () => ({
  useRequestNotifications: vi.fn(),
}));
vi.doMock('@/app/store/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/store/hooks')>();
  return {
    ...actual,
    useRequestHistory: mockUseRequestHistory,
  };
});

vi.mock('@/app/store/restClientSlice', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/app/store/restClientSlice')>();
  return { ...actual, sendRequest: hoistedMockSendRequest };
});

vi.mock('../MethodSelector/MethodSelector', () => ({
  default: vi.fn(() => (
    <div data-testid="mock-method-selector">MethodSelector</div>
  )),
}));
vi.mock('../UrlInput/UrlInput', () => ({
  default: vi.fn(({ value, onChange, onSend }: URLInputProps) => (
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
  )),
}));
vi.mock('../RequestResponseArea/RequestResponseArea', () => ({
  RequestResponseArea: vi.fn(() => (
    <div data-testid="mock-req-res-area">RequestResponseArea</div>
  )),
}));
vi.mock('../codeGenerator/CodeContainer', () => ({
  default: vi.fn(() => (
    <div data-testid="mock-code-container">CodeContainer</div>
  )),
}));
const originalLocation = window.location;
const mockLocation = (pathname: string, search: string) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: {
      ...originalLocation,
      pathname,
      search,
      assign: vi.fn(),
      replace: vi.fn(),
    },
  });
};
vi.spyOn(crypto, 'randomUUID').mockImplementation(
  () => `mock-uuid-${Math.random()}`
);
describe('ResizableContainer', () => {
  let mockDispatch: Mock;
  let restClientSliceModule: typeof import('@/app/store/restClientSlice');
  let initialRestClientState: RestClientState;
  let ResizableContainer: React.ComponentType<ResizableContainerProps>;

  beforeEach(async () => {
    restClientSliceModule = await import('@/app/store/restClientSlice');
    initialRestClientState = { ...restClientSliceModule.initialState };
    const componentModule = await import('./ResizableContainer');
    ResizableContainer = componentModule.default;

    vi.clearAllMocks();
    mockDispatch = vi.fn();
    mockUseSelector.mockClear();
    mockUseSelector.mockImplementation(
      (selectorFn: (state: RootState) => unknown) => {
        const testState: Partial<RootState> = {
          restClient: { ...initialRestClientState },
          variables: [],
          history: { items: [] },
        };
        return selectorFn(testState as RootState);
      }
    );

    mockDecodeFromBase64Url.mockClear();
    hoistedMockSendRequest.mockClear();
    mockUseRequestHistory.mockClear();

    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });

    const store = configureStore({
      reducer: {
        restClient: restClientSliceModule.default,
        variables: (state = []) => state,
        history: (state = { items: [] }) => state,
      },
      preloadedState: {
        restClient: { ...initialRestClientState },
        variables: [],
        history: { items: [] },
      },
    });
    vi.spyOn(store, 'dispatch').mockImplementation(mockDispatch);
  });

  it('should parse URL and dispatch initial actions on mount', async () => {
    const encodedUrl =
      'aHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20vZGF0YT9xdWVyeT0xJmxhbmc9ZW4=';
    const encodedBody = 'eyJpZCI6InRlc3QifQ==';
    const pathname = `/en/POST/${encodedUrl}/${encodedBody}`;
    const search = '?Content-Type=application%2Fjson&Auth=Bearer%20xyz';
    mockLocation(pathname, search);

    const decodedUrl = 'https://api.example.com/data?query=1&lang=en';
    const decodedBody = '{"id":"test"}';
    mockDecodeFromBase64Url
      .mockReturnValueOnce(decodedUrl)
      .mockReturnValueOnce(decodedBody);

    const store = configureStore({
      reducer: {
        restClient: restClientSliceModule.default,
        variables: (state = []) => state,
        history: (state = { items: [] }) => state,
      },
      preloadedState: {
        restClient: { ...initialRestClientState },
        variables: [],
        history: { items: [] },
      },
    });
    vi.spyOn(store, 'dispatch').mockImplementation(mockDispatch);

    const expectedMethod = 'POST';
    const expectedUrlPayload = decodedUrl;
    const expectedBodyPayload = decodedBody;
    const expectedHeadersPayload: Partial<KeyValueItem>[] = [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Auth', value: 'Bearer xyz' },
    ];
    const expectedQueryParamsPayload: Partial<KeyValueItem>[] = [
      { key: 'query', value: '1' },
      { key: 'lang', value: 'en' },
    ];

    render(
      <Provider store={store}>
        <ResizableContainer
          initialMethod="GET"
          initialUrl=""
          initialBody=""
          initialHeaders={[{ id: 'initial-empty', key: '', value: '' }]}
        />
      </Provider>
    );
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        restClientSliceModule.setMethod(expectedMethod)
      );
    });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        restClientSliceModule.setUrl(expectedUrlPayload)
      );
    });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        restClientSliceModule.setRequestBody(expectedBodyPayload)
      );
    });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        restClientSliceModule.setHeaders(
          expect.arrayContaining([
            expect.objectContaining(expectedHeadersPayload[0]),
            expect.objectContaining(expectedHeadersPayload[1]),
          ])
        )
      );
      const setHeadersAction = mockDispatch.mock.calls.find(
        (call) => call[0].type === restClientSliceModule.setHeaders.type
      );
      expect(setHeadersAction?.[0]?.payload).toHaveLength(
        expectedHeadersPayload.length
      );
    });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        restClientSliceModule.setQueryParams(
          expect.arrayContaining([
            expect.objectContaining(expectedQueryParamsPayload[0]),
            expect.objectContaining(expectedQueryParamsPayload[1]),
          ])
        )
      );
      const setQueryParamsAction = mockDispatch.mock.calls.find(
        (call) => call[0].type === restClientSliceModule.setQueryParams.type
      );
      expect(setQueryParamsAction?.[0]?.payload).toHaveLength(
        expectedQueryParamsPayload.length
      );
    });
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        restClientSliceModule.clearResponse()
      );
    });

    expect(mockDecodeFromBase64Url).toHaveBeenCalledTimes(2);
    expect(mockDecodeFromBase64Url).toHaveBeenNthCalledWith(1, encodedUrl);
    expect(mockDecodeFromBase64Url).toHaveBeenNthCalledWith(2, encodedBody);
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockUseRequestHistory).toHaveBeenCalled();
  });

  it('should dispatch setMethod when MethodSelector onChange is called', async () => {
    const store = configureStore({
      reducer: {
        restClient: restClientSliceModule.default,
        variables: (state = []) => state,
        history: (state = { items: [] }) => state,
      },
      preloadedState: {
        restClient: { ...initialRestClientState, method: 'GET' },
        variables: [],
        history: { items: [] },
      },
    });
    vi.spyOn(store, 'dispatch').mockImplementation(mockDispatch);

    const mockedMethodSelector = vi.mocked(MethodSelector);

    render(
      <Provider store={store}>
        <ResizableContainer />
      </Provider>
    );
    await waitFor(() => {
      expect(mockedMethodSelector).toHaveBeenCalled();
    });

    const lastCallProps = mockedMethodSelector.mock.lastCall?.[0];
    expect(lastCallProps).toBeDefined();
    const newMethod = 'PUT';
    lastCallProps!.onChange(newMethod);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        restClientSliceModule.setMethod(newMethod)
      );
    });
  });

  it('should dispatch sendRequest with filtered payload when Send button is clicked', async () => {
    const currentState: Partial<RestClientState> = {
      method: 'POST',
      url: 'https://example.com/submit?debug=true',
      requestBody: '{"value": 42}',
      headers: [
        { id: 'h1', key: 'Content-Type', value: 'application/json' },
        { id: 'h2', key: '', value: 'пустой ключ' },
        { id: 'h3', key: 'X-Custom', value: 'test-value' },
      ],
      queryParams: [
        { id: 'q1', key: 'filter', value: 'active' },
        { id: 'q2', key: '', value: 'пустой ключ' },
        { id: 'q3', key: 'sort', value: 'asc' },
      ],
      bodyLanguage: 'json',
      isLoading: false,
      error: null,
      responseData: null,
      responseStatus: null,
      responseContentType: null,
      activeTab: 'body',
    };
    const mockFullState: Partial<RootState> = {
      restClient: currentState as RestClientState,
      variables: [],
      history: { items: [] },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockFullState) => unknown) => {
        return selectorFn(mockFullState as RootState);
      }
    );

    const store = configureStore({
      reducer: {
        restClient: restClientSliceModule.default,
        variables: (s = []) => s,
        history: (s = { items: [] }) => s,
      },
      preloadedState: mockFullState as RootState,
    });
    vi.spyOn(store, 'dispatch').mockImplementation(mockDispatch);

    const expectedPayload: SendRequestPayload = {
      method: 'POST',
      targetUrl: 'https://example.com/submit?debug=true',
      headers: [
        { id: 'h1', key: 'Content-Type', value: 'application/json' },
        { id: 'h3', key: 'X-Custom', value: 'test-value' },
      ],
      queryParams: [
        { id: 'q1', key: 'filter', value: 'active' },
        { id: 'q3', key: 'sort', value: 'asc' },
      ],
      body: '{"value": 42}',
    };

    render(
      <Provider store={store}>
        <ResizableContainer />
      </Provider>
    );
    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(hoistedMockSendRequest).toHaveBeenCalledWith(expectedPayload);
    });
  });
  // it('should dispatch sendRequest when Send button is clicked', async () => { ... });
  // it('should call toggleCodePanel when toggle button is clicked', () => { ... });
  // it('should render CodeContainer when isCodePanelOpen is true', () => { ... });
});
