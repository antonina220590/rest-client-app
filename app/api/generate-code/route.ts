import { NextRequest, NextResponse } from 'next/server';
import * as codegen from 'postman-code-generators';
import * as sdk from 'postman-collection';

interface GenerateCodeRequestBody {
  selectedLanguage: string;
  method: string;
  url: string;
  headers: Array<{ id: string | number; key: string; value: string }>;
  requestBody: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateCodeRequestBody;
    if (!body.selectedLanguage || !body.method || !body.url) {
      return NextResponse.json(
        { error: 'Missing required fields (selectedLanguage, method, url)' },
        { status: 400 }
      );
    }

    const sdkRequest = new sdk.Request({
      method: body.method.toUpperCase(),
      url: body.url,
    });

    body.headers.forEach((header) => {
      if (header.key) {
        sdkRequest.addHeader(
          new sdk.Header({ key: header.key, value: header.value })
        );
      }
    });

    if (body.requestBody) {
      sdkRequest.body = new sdk.RequestBody({
        mode: 'raw',
        raw: body.requestBody,
      });
    }
    let language = 'curl';
    let variant = 'curl';

    const lowerSelectedLang = body.selectedLanguage.toLowerCase();
    if (lowerSelectedLang.includes('javascript - fetch')) {
      language = 'javascript';
      variant = 'fetch';
    } else if (lowerSelectedLang.includes('javascript - xhr')) {
      language = 'javascript';
      variant = 'xhr';
    } else if (lowerSelectedLang.includes('nodejs')) {
      language = 'nodejs';
      variant = 'native';
    } else if (lowerSelectedLang.includes('python')) {
      language = 'python';
      variant = 'requests';
    } else if (lowerSelectedLang.includes('java')) {
      language = 'java';
      variant = 'okhttp';
    } else if (lowerSelectedLang.includes('c#')) {
      language = 'csharp';
      variant = 'restsharp';
    } else if (lowerSelectedLang.includes('go')) {
      language = 'go';
      variant = 'native';
    } else if (lowerSelectedLang.includes('curl')) {
      language = 'curl';
      variant = 'curl';
    } else {
      language = 'curl';
      variant = 'curl';
    }

    const options = {
      indentCount: 2,
      indentType: 'Space',
      trimRequestBody: true,
      followRedirect: true,
    };

    const generatedSnippet: string = await new Promise((resolve, reject) => {
      codegen.convert(
        language,
        variant,
        sdkRequest,
        options,
        (error: Error | null, snippet: string | null | undefined) => {
          if (error) {
            reject(error);
          } else {
            resolve(snippet || '');
          }
        }
      );
    });

    return NextResponse.json({ code: generatedSnippet });
  } catch (error) {
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}
