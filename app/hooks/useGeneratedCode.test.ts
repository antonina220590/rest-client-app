import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGeneratedCode } from './useGeneratedCode';
import type { UseGeneratedCodeProps, Variable } from '@/app/interfaces';
import * as InterpolationHelper from '@/app/components/variables/helpers/interpolate';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string, values?: Record<string, unknown>): string => {
      if (values?.details) {
        return `${key}: ${values.details}`;
      }
      if (values?.language) {
        return `${key} for ${values.language}`;
      }
      return key;
    };
  },
}));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: vi.fn().mockReturnValue([] as Variable[]),
  };
});

const interpolateVariablesMock = vi.spyOn(
  InterpolationHelper,
  'interpolateVariables'
);
const fetchMock = vi.fn();

describe('useGeneratedCode Hook', () => {
  beforeEach(() => {
    global.fetch = fetchMock;
    interpolateVariablesMock.mockImplementation(
      (str: string | null | undefined, vars: Variable[] = []) => {
        if (!str) return '';
        let result = str;
        vars.forEach((v) => {
          const regex = new RegExp(`\\{\\{${v.key}\\}\\}`, 'g');
          result = result.replace(regex, v.value);
        });
        return result;
      }
    );
    vi.mocked(useSelector).mockReturnValue([] as Variable[]);
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps: UseGeneratedCodeProps = {
    selectedLanguage: 'curl',
    method: 'GET',
    url: 'https://example.com/api/data',
    headers: [],
    requestBody: '',
    variables: [],
  };

  it('should return initial placeholder message when URL is missing', () => {
    const { result } = renderHook((props) => useGeneratedCode(props), {
      initialProps: { ...defaultProps, url: '' },
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.generatedCode).toBe('providingURL');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should fetch and return generated code successfully using real timers', async () => {
    const mockGeneratedCode =
      'curl "https://example.com/api/data" -H "Accept: application/json"';
    const mockJsonResponse = { code: mockGeneratedCode };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockJsonResponse),
    });

    const { result } = renderHook((props) => useGeneratedCode(props), {
      initialProps: defaultProps,
    });

    expect(result.current.isLoading).toBe(false);
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.generatedCode).toBe(mockGeneratedCode);
      },
      { timeout: 1000 }
    );
    expect(result.current.isLoading).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/generate-code',
      expect.objectContaining({
        body: expect.stringContaining(defaultProps.url),
      })
    );
  });

  it('should handle API error (non-OK response)', async () => {
    const apiErrorDetails = 'Invalid parameters provided';
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: apiErrorDetails }),
    });

    const { result } = renderHook((props) => useGeneratedCode(props), {
      initialProps: defaultProps,
    });

    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 1000 }
    );

    expect(result.current.generatedCode).toBe('errorGeneration');
    expect(vi.mocked(toast.error)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
      'Code generation error',
      { description: apiErrorDetails }
    );
  });

  it('should handle network error when fetch fails', async () => {
    const networkErrorMessage = 'Failed to fetch';
    fetchMock.mockRejectedValueOnce(new Error(networkErrorMessage));

    const { result } = renderHook((props) => useGeneratedCode(props), {
      initialProps: defaultProps,
    });
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 1000 }
    );

    expect(result.current.generatedCode).toBe('errorGeneration');
    expect(vi.mocked(toast.error)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(toast.error)).toHaveBeenCalledWith(
      'Code generation error',
      { description: networkErrorMessage }
    );
  });

  it('should handle errors during variable interpolation', async () => {
    const interpolationErrorMsg = 'Variable {{undefinedVar}} not found';
    interpolateVariablesMock.mockImplementationOnce(() => {
      throw new Error(interpolationErrorMsg);
    });

    const { result } = renderHook((props) => useGeneratedCode(props), {
      initialProps: {
        ...defaultProps,
        url: 'https://example.com/{{undefinedVar}}',
      },
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(interpolateVariablesMock).toHaveBeenCalled();
    });
    expect(result.current.generatedCode).toBe(
      `variablesErrorDetails: ${interpolationErrorMsg}`
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });

  it('should call fetch with interpolated values from variables', async () => {
    const mockCode = 'generated code';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: mockCode }),
    });
    const mockVariables: Variable[] = [
      { id: 'v1', key: 'baseUrl', value: 'https://api.interpolated.com' },
      { id: 'v2', key: 'userId', value: 'user123' },
      { id: 'v3', key: 'token', value: 'xyz-token' },
    ];
    vi.mocked(useSelector).mockReturnValue(mockVariables);

    interpolateVariablesMock.mockImplementation(
      (str: string | null | undefined, _vars: Variable[] = []) => {
        if (str?.includes('{{baseUrl}}')) return 'DEBUG_INTERPOLATED_URL';
        if (str?.includes('Bearer {{token}}'))
          return 'DEBUG_INTERPOLATED_TOKEN';
        if (str?.includes('{{userId}}') && str?.includes('{'))
          return 'DEBUG_INTERPOLATED_BODY';
        if (str?.includes('{{userId}}') && !str?.includes('{'))
          return 'DEBUG_INTERPOLATED_USERID_HEADER';
        if (str === 'Authorization' || str === 'X-User-ID') return str;
        return str || '';
      }
    );

    const propsWithVars: UseGeneratedCodeProps = {
      ...defaultProps,
      method: 'POST',
      url: '{{baseUrl}}/users/{{userId}}',
      headers: [
        { id: 'h1', key: 'Authorization', value: 'Bearer {{token}}' },
        { id: 'h2', key: 'X-User-ID', value: '{{userId}}' },
      ],
      requestBody: '{"user": "{{userId}}", "data": "example"}',
    };

    const { result } = renderHook((props) => useGeneratedCode(props), {
      initialProps: propsWithVars,
    });
    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 1000 }
    );
    expect(result.current.generatedCode).toBe(mockCode);
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });
});
