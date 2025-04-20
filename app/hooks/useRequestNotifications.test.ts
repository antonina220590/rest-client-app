import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useRequestNotifications } from './useRequestNotifications';
import type { RootState } from '@/app/store/store';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => vi.fn((key: string) => key),
}));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

const mockAppState = (state: Partial<RootState['restClient']>) => {
  const defaultRestClientState: RootState['restClient'] = {
    isLoading: false,
    error: null,
    responseStatus: null,
    method: 'GET',
    url: '',
    requestBody: '',
    bodyLanguage: 'json',
    headers: [],
    queryParams: [],
    responseData: null,
    responseContentType: null,
    activeTab: 'query',
  };

  const mockRootState: RootState = {
    restClient: {
      ...defaultRestClientState,
      ...state,
    },
    variables: [],
    history: { items: [] },
  };

  vi.mocked(useSelector).mockImplementation((selectorFn) => {
    return selectorFn(mockRootState);
  });
};

describe('useRequestNotifications Hook', () => {
  beforeEach(() => {
    mockAppState({ isLoading: false, error: null, responseStatus: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not call any toast on initial render', () => {
    renderHook(() => useRequestNotifications());

    expect(vi.mocked(toast.success)).not.toHaveBeenCalled();
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it('should call toast.success when request finishes successfully', () => {
    const { rerender } = renderHook(() => useRequestNotifications());
    mockAppState({ isLoading: true, error: null, responseStatus: null });
    rerender();
    expect(vi.mocked(toast.success)).not.toHaveBeenCalled();
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
    mockAppState({ isLoading: false, error: null, responseStatus: 200 });
    rerender();

    expect(vi.mocked(toast.success)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
      'Request successful!'
    );
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it('should call toast.error when request fails and error appears', () => {
    const errorMessage = 'Network Failed or Server Error';
    const { rerender } = renderHook(() => useRequestNotifications());
    mockAppState({ isLoading: true, error: null, responseStatus: null });
    rerender();
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
    mockAppState({
      isLoading: false,
      error: errorMessage,
      responseStatus: 500,
    });
    rerender();
    expect(vi.mocked(toast.error)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Request Failed', {
      description: errorMessage,
    });
    expect(vi.mocked(toast.success)).not.toHaveBeenCalled();
  });
});
