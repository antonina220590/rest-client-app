import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import {
  usePathname,
  useSearchParams,
  ReadonlyURLSearchParams,
} from 'next/navigation';
import { useSyncUrlWithReduxState } from './useSyncUrlWithReduxState';
import * as EncodingHelper from '@/app/components/rest-client/helpers/encoding';
import type { RootState } from '@/app/store/store';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

vi.mock('../useDebounce', () => ({
  useDebounce: <T>(value: T, _delay: number): T => value,
}));

const encodeToBase64UrlSpy = vi.spyOn(EncodingHelper, 'encodeToBase64Url');
const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

const mockReduxState = (state: Partial<RootState['restClient']>) => {
  const defaultRestClientState: RootState['restClient'] = {
    method: 'GET',
    url: '',
    requestBody: '',
    bodyLanguage: 'json',
    headers: [],
    queryParams: [],
    isLoading: false,
    error: null,
    responseData: null,
    responseStatus: null,
    responseContentType: null,
    activeTab: 'query',
  };
  const mockRootState: RootState = {
    restClient: { ...defaultRestClientState, ...state },
    variables: [],
    history: { items: [] },
  };
  vi.mocked(useSelector).mockImplementation((selectorFn) =>
    selectorFn(mockRootState)
  );
};

const mockReadonlySearchParams = (search: string): ReadonlyURLSearchParams => {
  const params = new URLSearchParams(search);
  return {
    get: (name: string) => params.get(name),
    getAll: (name: string) => params.getAll(name),
    has: (name: string) => params.has(name),
    forEach: (
      callback: (value: string, key: string, parent: URLSearchParams) => void
    ) => params.forEach(callback),
    toString: () => params.toString(),
    entries: () => params.entries(),
    keys: () => params.keys(),
    values: () => params.values(),
    size: params.size,
    [Symbol.iterator]: () => params[Symbol.iterator](),
  } as ReadonlyURLSearchParams;
};

describe('useSyncUrlWithReduxState Hook', () => {
  let currentPathname: string;
  let currentSearch: string;
  const originalLocation = window.location;

  beforeEach(() => {
    currentPathname = '/en/GET/aHR0cDovL2luaXRpYWw';
    currentSearch = '?query=test';
    vi.mocked(usePathname).mockReturnValue(currentPathname);
    vi.mocked(useSearchParams).mockReturnValue(
      mockReadonlySearchParams(currentSearch)
    );

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        pathname: currentPathname,
        search: currentSearch,
      },
    });

    encodeToBase64UrlSpy.mockImplementation((str: string): string => {
      if (str === 'http://initial') return 'aHR0cDovL2luaXRpYWw=';
      if (str === 'http://newurl') return 'aHR0cDovL25ld3VybA==';
      if (str === '{"key":"value"}') return 'eyJrZXkiOiJ2YWx1ZSJ9';
      return `base64(${str})`;
    });

    mockReduxState({});
    replaceStateSpy.mockClear();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    vi.clearAllMocks();
  });

  it('should not call replaceState if redux state matches current URL (no search params)', () => {
    const pathnameWithoutParams = '/en/GET/aHR0cDovL2luaXRpYWw=';
    const searchWithoutParams = '';
    vi.mocked(usePathname).mockReturnValue(pathnameWithoutParams);
    vi.mocked(useSearchParams).mockReturnValue(
      mockReadonlySearchParams(searchWithoutParams)
    );
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        pathname: pathnameWithoutParams,
        search: searchWithoutParams,
      },
    });
    mockReduxState({
      method: 'GET',
      url: 'http://initial',
      requestBody: '',
      headers: [],
    });
    renderHook(() => useSyncUrlWithReduxState());
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });
});
