import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/generate-code/route';

import { NextRequest } from 'next/server';

const { mockCodegenConvert } = vi.hoisted(() => ({
  mockCodegenConvert: vi.fn(),
}));
const { mockSdkHeader } = vi.hoisted(() => ({ mockSdkHeader: vi.fn() }));
const { mockSdkRequestBody } = vi.hoisted(() => ({
  mockSdkRequestBody: vi.fn(),
}));
const { mockAddHeader } = vi.hoisted(() => ({ mockAddHeader: vi.fn() }));
const { mockSdkRequestInstance, mockSdkRequest } = vi.hoisted(() => {
  const instance = { addHeader: mockAddHeader, body: undefined as unknown };
  return {
    mockSdkRequestInstance: instance,
    mockSdkRequest: vi.fn(() => instance),
  };
});

const { mockNextResponseJsonFn } = vi.hoisted(() => ({
  mockNextResponseJsonFn: vi.fn((body?: unknown, init?: ResponseInit) => ({
    body,
    init,
    ok: !init || (init.status && init.status < 400),
    status: init?.status ?? 200,
  })),
}));

vi.mock('postman-code-generators', () => ({ convert: mockCodegenConvert }));
vi.mock('postman-collection', () => ({
  Request: mockSdkRequest,
  Header: mockSdkHeader,
  RequestBody: mockSdkRequestBody,
}));

vi.mock('next/server', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('next/server')>();
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: mockNextResponseJsonFn,
    },
  };
});

describe('API Route: /api/generate-code POST Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCodegenConvert.mockClear();
    mockSdkHeader.mockClear();
    mockSdkRequestBody.mockClear();
    mockAddHeader.mockClear();
    mockSdkRequest.mockClear();
    mockNextResponseJsonFn.mockClear();
    mockSdkRequestInstance.body = undefined;
  });

  it('should return generated code on valid input for curl', async () => {
    const expectedSnippet =
      'curl --location --request GET "https://example.com" --header "X-Test: true"';
    const requestBodyPayload = {
      selectedLanguage: 'curl',
      method: 'GET',
      url: 'https://example.com',
      headers: [{ id: 1, key: 'X-Test', value: 'true' }],
      requestBody: '',
    };
    mockCodegenConvert.mockImplementation(
      (lang, variant, request, options, callback) => {
        process.nextTick(() => callback(null, expectedSnippet));
      }
    );
    const mockRequest = new NextRequest('http://localhost/api/generate-code', {
      method: 'POST',
      body: JSON.stringify(requestBodyPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(mockRequest);
    expect(mockSdkRequest).toHaveBeenCalledOnce();
    expect(mockSdkRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://example.com',
    });
    expect(mockAddHeader).toHaveBeenCalledOnce();
    expect(mockSdkHeader).toHaveBeenCalledOnce();
    expect(mockSdkHeader).toHaveBeenCalledWith({
      key: 'X-Test',
      value: 'true',
    });
    expect(mockSdkRequestBody).not.toHaveBeenCalled();
    expect(mockSdkRequestInstance.body).toBeUndefined();
    expect(mockCodegenConvert).toHaveBeenCalledOnce();
    expect(mockCodegenConvert).toHaveBeenCalledWith(
      'curl',
      'curl',
      mockSdkRequestInstance,
      expect.objectContaining({ indentType: 'Space' }),
      expect.any(Function)
    );
    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith({
      code: expectedSnippet,
    });
    const callArgs = mockNextResponseJsonFn.mock.calls[0];
    expect(callArgs.length).toBe(1);
  });

  it('should return generated code for JavaScript Fetch with request body', async () => {
    const expectedSnippet = `Workspace("https://api.example.com/items", { /* ... fetch options ... */ });`;
    const requestBodyPayload = {
      selectedLanguage: 'JavaScript - Fetch',
      method: 'POST',
      url: 'https://api.example.com/items',
      headers: [
        { id: 'h1', key: 'Content-Type', value: 'application/json' },
        { id: 'h2', key: 'Authorization', value: 'Bearer 123' },
        { id: 'h3', key: '', value: 'EmptyKeyShouldBeSkipped' },
      ],
      requestBody: '{"name": "Test Item"}',
    };

    mockCodegenConvert.mockImplementation(
      (lang, variant, request, options, callback) => {
        process.nextTick(() => callback(null, expectedSnippet));
      }
    );
    const mockRequest = new NextRequest('http://localhost/api/generate-code', {
      method: 'POST',
      body: JSON.stringify(requestBodyPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(mockRequest);

    expect(mockSdkRequest).toHaveBeenCalledOnce();
    expect(mockSdkRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.example.com/items',
    });

    expect(mockAddHeader).toHaveBeenCalledTimes(2);
    expect(mockSdkHeader).toHaveBeenCalledTimes(2);
    expect(mockSdkHeader).toHaveBeenCalledWith({
      key: 'Content-Type',
      value: 'application/json',
    });
    expect(mockSdkHeader).toHaveBeenCalledWith({
      key: 'Authorization',
      value: 'Bearer 123',
    });

    expect(mockSdkRequestBody).toHaveBeenCalledOnce();
    expect(mockSdkRequestBody).toHaveBeenCalledWith({
      mode: 'raw',
      raw: '{"name": "Test Item"}',
    });
    expect(mockSdkRequestInstance.body).toBeDefined();
    expect(mockSdkRequestInstance.body).toBe(
      mockSdkRequestBody.mock.results[0].value
    );

    expect(mockCodegenConvert).toHaveBeenCalledOnce();
    expect(mockCodegenConvert).toHaveBeenCalledWith(
      'javascript',
      'fetch',
      mockSdkRequestInstance,
      expect.objectContaining({ trimRequestBody: true }),
      expect.any(Function)
    );

    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith({
      code: expectedSnippet,
    });
    const callArgs = mockNextResponseJsonFn.mock.calls[0];
    expect(callArgs.length).toBe(1);
  });
  it('should return 400 error if required fields are missing', async () => {
    const payloadMissingUrl = {
      selectedLanguage: 'python',
      method: 'POST',
      headers: [],
      requestBody: '{}',
    };
    const payloadMissingMethod = {
      selectedLanguage: 'python',
      url: 'http://test.com',
      headers: [],
      requestBody: '{}',
    };
    const payloadMissingLanguage = {
      method: 'PUT',
      url: 'http://test.com',
      headers: [],
      requestBody: '{}',
    };

    const testCases = [
      payloadMissingUrl,
      payloadMissingMethod,
      payloadMissingLanguage,
    ];

    const expectedErrorBody = {
      error: 'Missing required fields (selectedLanguage, method, url)',
    };
    const expectedErrorOptions = { status: 400 };

    for (const payload of testCases) {
      vi.clearAllMocks();
      mockSdkRequestInstance.body = undefined;

      const mockRequest = new NextRequest(
        'http://localhost/api/generate-code',
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      await POST(mockRequest);

      expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
      expect(mockNextResponseJsonFn).toHaveBeenCalledWith(
        expectedErrorBody,
        expectedErrorOptions
      );

      expect(mockSdkRequest).not.toHaveBeenCalled();
      expect(mockCodegenConvert).not.toHaveBeenCalled();
    }
  });
  it('should return 500 error if codegen.convert fails', async () => {
    const testErrorMessage = 'Conversion process failed miserably!';
    const codegenError = new Error(testErrorMessage);
    const requestBodyPayload = {
      selectedLanguage: 'python',
      method: 'GET',
      url: 'https://will-fail.com',
      headers: [],
      requestBody: '',
    };
    mockCodegenConvert.mockImplementation(
      (lang, variant, request, options, callback) => {
        process.nextTick(() => callback(codegenError, null));
      }
    );

    const mockRequest = new NextRequest('http://localhost/api/generate-code', {
      method: 'POST',
      body: JSON.stringify(requestBodyPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(mockRequest);

    expect(mockCodegenConvert).toHaveBeenCalledOnce();
    expect(mockCodegenConvert).toHaveBeenCalledWith(
      'python',
      'requests',
      mockSdkRequestInstance,
      expect.any(Object),
      expect.any(Function)
    );

    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith(
      { error: 'Internal Server Error', details: testErrorMessage },
      { status: 500 }
    );
    expect(mockSdkRequest).toHaveBeenCalledOnce();
  });

  it('should return 500 error if request body parsing fails', async () => {
    const jsonParseErrorMessage =
      'Unexpected token \'i\', "invalid json" is not valid JSON';
    const jsonParseError = new Error(jsonParseErrorMessage);
    const mockRequest = {
      json: vi.fn().mockRejectedValueOnce(jsonParseError),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      method: 'POST',
    } as unknown as NextRequest;

    await POST(mockRequest);

    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith(
      { error: 'Internal Server Error', details: jsonParseErrorMessage },
      { status: 500 }
    );

    expect(mockSdkRequest).not.toHaveBeenCalled();
    expect(mockCodegenConvert).not.toHaveBeenCalled();
  });
  it('should use correct language and variant mapping for NodeJS', async () => {
    const expectedSnippet = 'var http = require("http"); // NodeJS snippet';
    const requestBodyPayload = {
      selectedLanguage: 'NodeJS',
      method: 'PUT',
      url: 'https://another-api.net/data',
      headers: [],
      requestBody: '{"value": 100}',
    };

    mockCodegenConvert.mockImplementation(
      (lang, variant, request, options, callback) => {
        process.nextTick(() => callback(null, expectedSnippet));
      }
    );

    const mockRequest = new NextRequest('http://localhost/api/generate-code', {
      method: 'POST',
      body: JSON.stringify(requestBodyPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(mockRequest);

    expect(mockCodegenConvert).toHaveBeenCalledOnce();
    expect(mockCodegenConvert).toHaveBeenCalledWith(
      'nodejs',
      'native',
      mockSdkRequestInstance,
      expect.any(Object),
      expect.any(Function)
    );

    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith({
      code: expectedSnippet,
    });
    const callArgs = mockNextResponseJsonFn.mock.calls[0];
    expect(callArgs.length).toBe(1);
    expect(mockSdkRequestBody).toHaveBeenCalledOnce();
    expect(mockSdkRequestInstance.body).toBeDefined();
  });
  it('should default to curl language and variant if selectedLanguage is not recognized', async () => {
    const expectedSnippet = 'curl "http://some-other-url.com"';
    const requestBodyPayload = {
      selectedLanguage: 'PHP',
      method: 'GET',
      url: 'http://some-other-url.com',
      headers: [],
      requestBody: '',
    };

    mockCodegenConvert.mockImplementation(
      (lang, variant, request, options, callback) => {
        process.nextTick(() => callback(null, expectedSnippet));
      }
    );

    const mockRequest = new NextRequest('http://localhost/api/generate-code', {
      method: 'POST',
      body: JSON.stringify(requestBodyPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(mockRequest);

    expect(mockCodegenConvert).toHaveBeenCalledOnce();
    expect(mockCodegenConvert).toHaveBeenCalledWith(
      'curl',
      'curl',
      mockSdkRequestInstance,
      expect.any(Object),
      expect.any(Function)
    );

    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith({
      code: expectedSnippet,
    });
    const callArgs = mockNextResponseJsonFn.mock.calls[0];
    expect(callArgs.length).toBe(1);
  });
  it('should return { code: "" } if codegen.convert provides null or undefined snippet', async () => {
    const requestBodyPayload = {
      selectedLanguage: 'curl',
      method: 'GET',
      url: 'https://anything.com',
      headers: [],
      requestBody: '',
    };
    const expectedResponseBody = { code: '' };
    const snippetValuesToTest: (null | undefined)[] = [null, undefined];

    for (const snippetValue of snippetValuesToTest) {
      vi.clearAllMocks();
      mockSdkRequestInstance.body = undefined;

      mockCodegenConvert.mockImplementation(
        (lang, variant, request, options, callback) => {
          process.nextTick(() => callback(null, snippetValue));
        }
      );

      const mockRequest = new NextRequest(
        'http://localhost/api/generate-code',
        {
          method: 'POST',
          body: JSON.stringify(requestBodyPayload),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      await POST(mockRequest);
      expect(mockCodegenConvert).toHaveBeenCalledOnce();

      expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
      expect(mockNextResponseJsonFn).toHaveBeenCalledWith(expectedResponseBody);
      const callArgs = mockNextResponseJsonFn.mock.calls[0];
      expect(callArgs.length).toBe(1);
    }
  });
  it('should return 500 error with string details if a string is thrown/rejected', async () => {
    const testErrorString = 'Просто текстовая ошибка';

    const mockRequest = {
      json: vi.fn().mockRejectedValueOnce(testErrorString),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      method: 'POST',
    } as unknown as NextRequest;

    await POST(mockRequest);

    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith(
      { error: 'Internal Server Error', details: testErrorString },
      { status: 500 }
    );
    expect(mockSdkRequest).not.toHaveBeenCalled();
    expect(mockCodegenConvert).not.toHaveBeenCalled();
  });
  it('should return 500 error with default details if a non-Error/non-string is thrown/rejected', async () => {
    const testErrorObject = { code: 123, data: null };
    const expectedDefaultDetails = 'An unexpected error occurred';
    const mockRequest = {
      json: vi.fn().mockRejectedValueOnce(testErrorObject),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      method: 'POST',
    } as unknown as NextRequest;

    await POST(mockRequest);
    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith(
      { error: 'Internal Server Error', details: expectedDefaultDetails },
      { status: 500 }
    );
    expect(mockSdkRequest).not.toHaveBeenCalled();
    expect(mockCodegenConvert).not.toHaveBeenCalled();
  });
  it('should use correct language and variant mapping for Java', async () => {
    const expectedSnippet = '// Java OkHttp Snippet';
    const requestBodyPayload = {
      selectedLanguage: 'Java',
      method: 'GET',
      url: 'https://api.java-test.com/health',
      headers: [{ id: 'a1', key: 'X-Request-ID', value: 'java-test-123' }],
      requestBody: '',
    };

    mockCodegenConvert.mockImplementation(
      (lang, variant, request, options, callback) => {
        process.nextTick(() => callback(null, expectedSnippet));
      }
    );

    const mockRequest = new NextRequest('http://localhost/api/generate-code', {
      method: 'POST',
      body: JSON.stringify(requestBodyPayload),
      headers: { 'Content-Type': 'application/json' },
    });

    await POST(mockRequest);

    expect(mockCodegenConvert).toHaveBeenCalledOnce();
    expect(mockCodegenConvert).toHaveBeenCalledWith(
      'java',
      'okhttp',
      mockSdkRequestInstance,
      expect.any(Object),
      expect.any(Function)
    );
    expect(mockNextResponseJsonFn).toHaveBeenCalledOnce();
    expect(mockNextResponseJsonFn).toHaveBeenCalledWith({
      code: expectedSnippet,
    });
    const callArgs = mockNextResponseJsonFn.mock.calls[0];
    expect(callArgs.length).toBe(1);
    expect(mockAddHeader).toHaveBeenCalledOnce();
    expect(mockSdkHeader).toHaveBeenCalledWith({
      key: 'X-Request-ID',
      value: 'java-test-123',
    });
  });
});
