import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
//import type { RootState } from '@/app/store/store';
import type { RestClientState } from '@/app/interfaces';
import type { FormattedResponse } from './useFormattedResponse';

const mockToastError = vi.fn();
const mockUseSelector = vi.fn();

vi.doMock('sonner', () => ({
  toast: {
    error: mockToastError,
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.doMock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: mockUseSelector,
  };
});

describe('useFormattedResponse', () => {
  let useFormattedResponse: () => FormattedResponse;

  beforeEach(async () => {
    mockToastError.mockClear();
    mockUseSelector.mockClear();
    mockUseSelector.mockImplementation(() => {});

    const hookModule = await import('./useFormattedResponse');
    useFormattedResponse = hookModule.default;
  });
  it('should return empty plaintext when loading', () => {
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: true,
        responseData: '{"some": "data"}',
        responseContentType: 'application/json',
        responseStatus: 200,
      },
    };

    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );

    const expectedResult: FormattedResponse = {
      displayValue: '',
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());
    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockUseSelector).toHaveBeenCalledTimes(4);
  });
});
