import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  it('should return empty plaintext when responseData is null', () => {
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: null,
        responseContentType: null,
        responseStatus: null,
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

  it('should return empty plaintext when responseData is undefined', () => {
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: undefined,
        responseContentType: null,
        responseStatus: null,
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

  it('should return prettified JSON when response is successful JSON', () => {
    const rawJsonString = '{"user":{"id":1,"name":"Test"},"status":200}';
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: rawJsonString,
        responseContentType: 'application/json; charset=utf-8',
        responseStatus: 200,
      },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );

    const expectedPrettyJson = JSON.stringify(
      JSON.parse(rawJsonString),
      null,
      2
    );
    const expectedResult: FormattedResponse = {
      displayValue: expectedPrettyJson,
      displayLanguage: 'json',
    };

    const { result } = renderHook(() => useFormattedResponse());

    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockUseSelector).toHaveBeenCalledTimes(4);
  });

  it('should return raw data as plaintext for non-JSON successful response', () => {
    const plainTextResponse = 'This is a simple text response.';
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: plainTextResponse,
        responseContentType: 'text/plain; charset=iso-8859-1',
        responseStatus: 200,
      },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );

    const expectedResult: FormattedResponse = {
      displayValue: plainTextResponse,
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());

    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockUseSelector).toHaveBeenCalledTimes(4);
  });

  it('should return raw data as plaintext for HTML successful response', () => {
    const htmlResponse = '<html><body><h1>Title</h1></body></html>';
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: htmlResponse,
        responseContentType: 'text/html',
        responseStatus: 200,
      },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );
    const expectedResult: FormattedResponse = {
      displayValue: htmlResponse,
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());
    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockUseSelector).toHaveBeenCalledTimes(4);
  });

  it('should return raw data as plaintext and call toast.error for invalid JSON', () => {
    const invalidJsonString = '{"key": "value", malformed:}';
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: invalidJsonString,
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
      displayValue: invalidJsonString,
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());

    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).toHaveBeenCalledOnce();
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining('JSON parse error')
    );
    expect(mockUseSelector).toHaveBeenCalledTimes(4);
  });

  it('should return specific "404 Not Found" message for status 404', () => {
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: 'Тело ответа для 404 (игнорируется)',
        responseContentType: 'text/plain',
        responseStatus: 404,
      },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );

    const expectedResult: FormattedResponse = {
      displayValue: '404 Not Found',
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());

    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockUseSelector).toHaveBeenCalledTimes(4);
  });

  it('should return raw data as plaintext for error status with non-JSON body', () => {
    const errorBody = 'Internal Server Error Details';
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: errorBody,
        responseContentType: 'text/plain',
        responseStatus: 500,
      },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );
    const expectedResult: FormattedResponse = {
      displayValue: errorBody,
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());
    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('should return error field value as plaintext for error status with JSON body containing "error" field', () => {
    const errorBodyJson = '{"error": "Invalid API Key", "code": 401}';
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: errorBodyJson,
        responseContentType: 'application/json',
        responseStatus: 401,
      },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );
    const expectedResult: FormattedResponse = {
      displayValue: 'Invalid API Key',
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());

    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('should return raw JSON string as plaintext for error status with JSON body lacking "error" field', () => {
    const errorBodyJson = '{"message": "Bad Request", "statusCode": 400}';
    const mockState: { restClient: Partial<RestClientState> } = {
      restClient: {
        isLoading: false,
        responseData: errorBodyJson,
        responseContentType: 'application/json',
        responseStatus: 400,
      },
    };
    mockUseSelector.mockImplementation(
      (selectorFn: (state: typeof mockState) => unknown) => {
        return selectorFn(mockState);
      }
    );
    const expectedResult: FormattedResponse = {
      displayValue: errorBodyJson,
      displayLanguage: 'plaintext',
    };

    const { result } = renderHook(() => useFormattedResponse());
    expect(result.current).toEqual(expectedResult);
    expect(mockToastError).not.toHaveBeenCalled();
  });
});
