import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Route: /api/', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should forward request and return successful response', async () => {
    const mockRequestPayload = {
      method: 'POST',
      targetUrl: 'https://example.com/data',
      headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json' }],
      queryParams: [{ id: 'q1', key: 'test', value: '123' }],
      body: JSON.stringify({ message: 'hello' }),
    };

    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockRequestPayload),
    } as unknown as NextRequest;

    const mockApiResponse = {
      ok: true,
      status: 201,
      statusText: 'Created',
      headers: new Headers({
        'Content-Type': 'application/json',
        'X-Response-ID': 'res-123',
      }),
      text: vi
        .fn()
        .mockResolvedValue(JSON.stringify({ result: 'success', id: 1 })),
    };
    mockFetch.mockResolvedValue(mockApiResponse);

    const response = await POST(mockRequest);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/data?test=123',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'hello' }),
      })
    );

    expect(response instanceof NextResponse).toBe(true);
    const responseJson = await response.json();
    expect(response.status).toBe(200);
    expect(responseJson).toEqual({
      status: 201,
      headers: {
        'content-type': 'application/json',
        'x-response-id': 'res-123',
      },
      body: JSON.stringify({ result: 'success', id: 1 }),
      error: null,
    });
  });

  it('should return error response when target API fails', async () => {
    const mockRequestPayload = {
      method: 'POST',
      targetUrl: 'https://example.com/data',
      headers: [
        { id: 'h1', key: 'Content-Type', value: 'application/json' },
        { id: 'h2', key: 'Authorization', value: 'Bearer test-token' },
      ],
      queryParams: [
        { id: 'q1', key: 'page', value: '1' },
        { id: 'q2', key: 'limit', value: '10' },
      ],
      body: JSON.stringify({ message: 'hello', value: 42 }),
    };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockRequestPayload),
    } as unknown as NextRequest;

    const mockApiErrorResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: vi
        .fn()
        .mockResolvedValue(JSON.stringify({ message: 'Resource not found' })),
    };
    mockFetch.mockResolvedValue(mockApiErrorResponse);

    const response = await POST(mockRequest);
    expect(response instanceof NextResponse).toBe(true);
    const responseJson = await response.json();
    expect(response.status).toBe(200);
    expect(responseJson.status).toBe(404);
    expect(responseJson.error).toContain('Target API returned status 404');
    expect(responseJson.body).toEqual(
      JSON.stringify({ message: 'Resource not found' })
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return 500 if fetch itself fails', async () => {
    const mockRequestPayload = {
      method: 'POST',
      targetUrl: 'https://example.com/data',
      headers: [
        { id: 'h1', key: 'Content-Type', value: 'application/json' },
        { id: 'h2', key: 'Authorization', value: 'Bearer test-token' },
      ],
      queryParams: [
        { id: 'q1', key: 'page', value: '1' },
        { id: 'q2', key: 'limit', value: '10' },
      ],
      body: JSON.stringify({ message: 'hello', value: 42 }),
    };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockRequestPayload),
    } as unknown as NextRequest;

    const fetchError = new Error('Network Error');
    mockFetch.mockRejectedValue(fetchError);

    const response = await POST(mockRequest);
    expect(response instanceof NextResponse).toBe(true);
    const responseJson = await response.json();
    expect(response.status).toBe(500);
    expect(responseJson.status).toBe(500);
    expect(responseJson.error).toBe('Network Error');
    expect(responseJson.body).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should return 400 if targetUrl is missing', async () => {
    const mockInvalidPayload = {
      method: 'GET',
      headers: [],
      queryParams: [],
      body: null,
    };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockInvalidPayload),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    expect(response instanceof NextResponse).toBe(true);
    const responseJson = await response.json();
    expect(response.status).toBe(400);
    expect(responseJson.error).toBe('Missing method or targetUrl');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should return 500 if new URL() fails', async () => {
    const mockRequestPayload = {
      method: 'GET',
      targetUrl: 'это не валидный url',
      headers: [],
      queryParams: [],
      body: null,
    };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockRequestPayload),
    } as unknown as NextRequest;

    const response = await POST(mockRequest);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(response instanceof NextResponse).toBe(true);
    const responseJson = await response.json();
    expect(response.status).toBe(500);
    expect(responseJson.status).toBe(500);
    expect(responseJson.error).toContain('Invalid URL');
  });
  it('should send undefined body for GET requests', async () => {
    const mockRequestPayload = {
      method: 'GET',
      targetUrl: 'https://example.com/data',
      headers: [],
      queryParams: [],
      body: '{"this_should_be_ignored":"true"}',
    };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockRequestPayload),
    } as unknown as NextRequest;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: vi.fn().mockResolvedValue('Success'),
    });
    await POST(mockRequest);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/data',
      expect.objectContaining({
        method: 'GET',
        body: undefined,
      })
    );
  });

  it('should correctly append query params to a URL that already has params', async () => {
    const mockRequestPayload = {
      method: 'GET',
      targetUrl: 'https://example.com/path?existing=true',
      headers: [],
      queryParams: [{ id: 'q1', key: 'new', value: 'yes' }],
      body: null,
    };
    const mockRequest = {
      json: vi.fn().mockResolvedValue(mockRequestPayload),
    } as unknown as NextRequest;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: vi.fn().mockResolvedValue('Success'),
    });
    await POST(mockRequest);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/path?existing=true&new=yes',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
