import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { KeyValueItem } from '@/app/interfaces';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      method,
      targetUrl,
      headers: headerArray,
      queryParams: queryParamsArray,
      body,
    } = payload;

    if (!method || !targetUrl) {
      return NextResponse.json(
        { error: 'Missing method or targetUrl' },
        { status: 400 }
      );
    }

    const url = new URL(targetUrl);
    if (queryParamsArray && Array.isArray(queryParamsArray)) {
      queryParamsArray.forEach((param: KeyValueItem) => {
        if (param.key) {
          url.searchParams.append(param.key, param.value || '');
        }
      });
    }

    const headersObject: Record<string, string> = {};
    if (headerArray && Array.isArray(headerArray)) {
      headerArray.forEach((header: KeyValueItem) => {
        if (header.key) {
          headersObject[header.key] = header.value || '';
        }
      });
    }
    delete headersObject['host'];
    delete headersObject['content-length'];

    const apiResponse = await fetch(url.toString(), {
      method: method,
      headers: headersObject,
      body: method !== 'GET' && method !== 'HEAD' && body ? body : undefined,
    });

    const responseBody = await apiResponse.text();
    const responseHeaders: Record<string, string> = {};
    apiResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return NextResponse.json({
      status: apiResponse.status,
      headers: responseHeaders,
      body: responseBody,
      error: apiResponse.ok
        ? null
        : `Target API returned status ${apiResponse.status}`,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown proxy error';
    return NextResponse.json(
      { error: errorMessage, status: 500 },
      { status: 500 }
    );
  }
}
