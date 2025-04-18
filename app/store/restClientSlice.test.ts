import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import reducer, {
  setUrl,
  addQueryParam,
  updateQueryParamKey,
  updateQueryParamValue,
  deleteQueryParam,
  initialState,
  deleteHeader,
  updateHeaderValue,
  updateHeaderKey,
  addHeader,
  setRequestBody,
  setBodyLanguage,
  setHeaders,
  setQueryParams,
  clearResponse,
  clearAllRequestState,
  sendRequest,
} from './restClientSlice';
import type {
  RestClientState,
  KeyValueItem,
  BodyLanguage,
  SendRequestPayload,
  SendRequestSuccessPayload,
  RootState,
  RejectPayload,
  Variable,
} from '@/app/interfaces';

import * as InterpolationHelper from '@/app/components/variables/helpers/interpolate';
import { buildUrlWithParams } from '@/app/components/rest-client/helpers/urlBuilder';

const mockUUIDPrefix = 'mock-uuid-';
let uuidCounter = 0;
vi.spyOn(crypto, 'randomUUID').mockImplementation(
  () => `${mockUUIDPrefix}${uuidCounter++}`
);

const getCleanInitialState = (): RestClientState => {
  uuidCounter = 0;
  return {
    method: 'GET',
    url: '',
    requestBody: '',
    bodyLanguage: 'json',
    headers: [{ id: crypto.randomUUID(), key: '', value: '' }],
    queryParams: [{ id: crypto.randomUUID(), key: '', value: '' }],
    isLoading: false,
    error: null,
    responseData: null,
    responseStatus: null,
    responseContentType: null,
    activeTab: 'query',
  };
};

const fetchMock = vi.fn();
global.fetch = fetchMock;

const interpolateVariablesMock = vi.spyOn(
  InterpolationHelper,
  'interpolateVariables'
);

describe('restClientSlice Reducers', () => {
  beforeEach(() => {
    uuidCounter = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle setUrl and parse query params correctly', () => {
    const previousState = getCleanInitialState();
    uuidCounter = 0;

    const newUrl = 'http://example.com/path?a=1&b=two&encoded=a%20b';
    const action = setUrl(newUrl);
    const newState = reducer(previousState, action);

    expect(newState.url).toBe(newUrl);
    expect(newState.queryParams).toEqual([
      { id: 'mock-uuid-0', key: 'a', value: '1' },
      { id: 'mock-uuid-1', key: 'b', value: 'two' },
      { id: 'mock-uuid-2', key: 'encoded', value: 'a b' },
    ]);
  });

  it('should handle setUrl with no query params', () => {
    const previousState = getCleanInitialState();
    uuidCounter = 0;
    previousState.queryParams = [{ id: 'old-id', key: 'old', value: 'true' }];
    previousState.url = 'http://old.com?old=true';

    const newUrl = 'http://example.com/newpath';
    const action = setUrl(newUrl);
    const newState = reducer(previousState, action);

    expect(newState.url).toBe(newUrl);
    expect(newState.queryParams).toEqual([
      { id: 'mock-uuid-0', key: '', value: '' },
    ]);
  });

  it('should decode template variables in query params when handling setUrl', () => {
    const previousState = getCleanInitialState();
    uuidCounter = 0;

    const newUrl = 'http://example.com?templateKey=%7B%7BmyVar%7D%7D';
    const action = setUrl(newUrl);
    const newState = reducer(previousState, action);

    expect(newState.url).toBe(newUrl);
    expect(newState.queryParams).toEqual([
      { id: 'mock-uuid-0', key: 'templateKey', value: '{{myVar}}' },
    ]);
  });

  it('should handle setUrl with invalid URL gracefully', () => {
    const previousState = getCleanInitialState();
    uuidCounter = 0;
    previousState.queryParams = [{ id: 'old-id', key: 'old', value: 'true' }];
    previousState.url = 'http://old.com?old=true';

    const newUrl = 'this is not a valid url';
    const action = setUrl(newUrl);
    const newState = reducer(previousState, action);

    expect(newState.url).toBe(newUrl);
    expect(newState.queryParams).toEqual([
      { id: 'mock-uuid-0', key: '', value: '' },
    ]);
  });

  describe('Query Param Reducers', () => {
    it('should handle addQueryParam correctly', () => {
      const previousState: RestClientState = {
        method: 'GET',
        url: 'http://base.url',
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

      const action1 = addQueryParam();
      const state1 = reducer(previousState, action1);

      const expectedParams1 = [{ id: 'mock-uuid-0', key: '', value: '' }];
      expect(state1.queryParams).toEqual(expectedParams1);
      const expectedUrl1 = buildUrlWithParams(
        previousState.url,
        expectedParams1
      );
      expect(state1.url).toBe(expectedUrl1);

      const action2 = addQueryParam();
      const state2 = reducer(state1, action2);

      const expectedParams2 = [
        { id: 'mock-uuid-0', key: '', value: '' },
        { id: 'mock-uuid-1', key: '', value: '' },
      ];
      expect(state2.queryParams).toEqual(expectedParams2);
      const expectedUrl2 = buildUrlWithParams(state1.url, expectedParams2);
      expect(state2.url).toBe(expectedUrl2);
    });

    it('should handle updateQueryParamKey and update url', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.url = 'http://base.url';
      previousState.queryParams = [
        { id: 'param1', key: 'oldKey', value: 'value1' },
      ];

      const action = updateQueryParamKey({ id: 'param1', key: 'newKey' });
      const newState = reducer(previousState, action);

      const expectedParams = [{ id: 'param1', key: 'newKey', value: 'value1' }];
      expect(newState.queryParams).toEqual(expectedParams);
      const expectedUrl = buildUrlWithParams(previousState.url, expectedParams);
      expect(newState.url).toBe(expectedUrl);
    });

    it('should handle updateQueryParamValue and update url', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.url = 'http://base.url?key1=oldValue';
      previousState.queryParams = [
        { id: 'param1', key: 'key1', value: 'oldValue' },
      ];

      const action = updateQueryParamValue({ id: 'param1', value: 'newValue' });
      const newState = reducer(previousState, action);

      const expectedParams = [{ id: 'param1', key: 'key1', value: 'newValue' }];
      expect(newState.queryParams).toEqual(expectedParams);
      const expectedUrl = buildUrlWithParams(previousState.url, expectedParams);
      expect(newState.url).toBe(expectedUrl);
    });

    it('should handle deleteQueryParam and update url', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.url = 'http://base.url?p1=v1&p2=v2';
      previousState.queryParams = [
        { id: 'param1', key: 'p1', value: 'v1' },
        { id: 'param2', key: 'p2', value: 'v2' },
      ];

      const action = deleteQueryParam('param1');
      const newState = reducer(previousState, action);

      const expectedParams = [{ id: 'param2', key: 'p2', value: 'v2' }];
      expect(newState.queryParams).toEqual(expectedParams);
      const expectedUrl = buildUrlWithParams(previousState.url, expectedParams);
      expect(newState.url).toBe(expectedUrl);
    });

    it('should add an empty param if deleteQueryParam removes the last one', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.url = 'http://base.url?p1=v1';
      previousState.queryParams = [{ id: 'param1', key: 'p1', value: 'v1' }];

      const action = deleteQueryParam('param1');
      const newState = reducer(previousState, action);

      const expectedParams = [{ id: 'mock-uuid-0', key: '', value: '' }];
      expect(newState.queryParams).toEqual(expectedParams);
      const expectedUrl = buildUrlWithParams(previousState.url, expectedParams);
      expect(newState.url).toBe(expectedUrl);
    });
  });

  describe('Header Reducers', () => {
    it('should handle addHeader', () => {
      const previousState: RestClientState = {
        method: 'GET',
        url: '',
        requestBody: '',
        bodyLanguage: 'json',
        headers: [{ id: 'initial-header-id', key: '', value: '' }],
        queryParams: [],
        isLoading: false,
        error: null,
        responseData: null,
        responseStatus: null,
        responseContentType: null,
        activeTab: 'query',
      };
      const action = addHeader();
      const newState = reducer(previousState, action);
      expect(newState.headers).toHaveLength(2);
      expect(newState.headers[0]).toEqual({
        id: 'initial-header-id',
        key: '',
        value: '',
      });
      expect(newState.headers[1]).toEqual({
        id: 'mock-uuid-0',
        key: '',
        value: '',
      });
    });

    it('should handle updateHeaderKey', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.headers = [
        { id: 'header1', key: 'Old-Key', value: 'value1' },
      ];

      const action = updateHeaderKey({ id: 'header1', key: 'New-Key' });
      const newState = reducer(previousState, action);

      expect(newState.headers[0].key).toBe('New-Key');
      expect(newState.headers[0].value).toBe('value1');
    });

    it('should handle updateHeaderValue', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.headers = [
        { id: 'header1', key: 'Key1', value: 'Old-Value' },
      ];

      const action = updateHeaderValue({ id: 'header1', value: 'New-Value' });
      const newState = reducer(previousState, action);

      expect(newState.headers[0].key).toBe('Key1');
      expect(newState.headers[0].value).toBe('New-Value');
    });

    it('should handle deleteHeader', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.headers = [
        { id: 'header1', key: 'Key1', value: 'Val1' },
        { id: 'header2', key: 'Key2', value: 'Val2' },
      ];

      const action = deleteHeader('header1');
      const newState = reducer(previousState, action);

      expect(newState.headers).toHaveLength(1);
      expect(newState.headers[0].id).toBe('header2');
    });

    it('should add an empty header if deleteHeader removes the last one', () => {
      const previousState = getCleanInitialState();
      uuidCounter = 0;
      previousState.headers = [{ id: 'header1', key: 'Key1', value: 'Val1' }];

      const action = deleteHeader('header1');
      const newState = reducer(previousState, action);
      expect(newState.headers).toHaveLength(1);
      expect(newState.headers[0]).toEqual({
        id: 'mock-uuid-0',
        key: '',
        value: '',
      });
    });
  });
  it('should handle setRequestBody', () => {
    const previousState = getCleanInitialState();
    const newBody = '{"new": "content"}';
    const action = setRequestBody(newBody);
    const newState = reducer(previousState, action);
    expect(newState.requestBody).toBe(newBody);
    expect(newState.url).toBe(previousState.url);
  });

  it('should handle setBodyLanguage', () => {
    const previousState = getCleanInitialState();
    const newLang: BodyLanguage = 'plaintext';
    const action = setBodyLanguage(newLang);
    const newState = reducer(previousState, action);
    expect(newState.bodyLanguage).toBe(newLang);
  });

  it('should handle setHeaders with a non-empty array', () => {
    const previousState = getCleanInitialState();
    const newHeaders: KeyValueItem[] = [
      { id: 'h1', key: 'X-Custom', value: 'Test' },
      { id: 'h2', key: 'Accept', value: '*/*' },
    ];
    const action = setHeaders(newHeaders);
    const newState = reducer(previousState, action);
    expect(newState.headers).toEqual(newHeaders);
  });

  it('should handle setHeaders with an empty array (add default empty)', () => {
    const previousState = getCleanInitialState();
    uuidCounter = 0;
    const newHeaders: KeyValueItem[] = [];
    const action = setHeaders(newHeaders);
    const newState = reducer(previousState, action);
    expect(newState.headers).toEqual([
      { id: 'mock-uuid-0', key: '', value: '' },
    ]);
  });

  it('should handle setQueryParams and update url', () => {
    const previousState = getCleanInitialState();
    uuidCounter = 0;
    previousState.url = 'http://test.com/base';

    const newParams: KeyValueItem[] = [
      { id: 'p1', key: 'search', value: 'term' },
      { id: 'p2', key: 'limit', value: '10' },
    ];
    const action = setQueryParams(newParams);
    const newState = reducer(previousState, action);
    expect(newState.queryParams).toEqual(newParams);
    const expectedUrl = buildUrlWithParams(previousState.url, newParams);
    expect(newState.url).toBe(expectedUrl);
  });

  it('should handle setQueryParams with an empty array (add default empty) and update url', () => {
    const previousState = getCleanInitialState();
    uuidCounter = 0;
    previousState.url = 'http://test.com/base?old=true';

    const newParams: KeyValueItem[] = [];
    const action = setQueryParams(newParams);
    const newState = reducer(previousState, action);

    const expectedDefaultParams = [{ id: 'mock-uuid-0', key: '', value: '' }];
    expect(newState.queryParams).toEqual(expectedDefaultParams);

    expect(newState.url).toBe('http://test.com/base');
  });

  it('should handle clearResponse', () => {
    const previousState: RestClientState = {
      ...getCleanInitialState(),
      isLoading: true,
      error: 'Some Error',
      responseData: 'Some Data',
      responseStatus: 500,
      responseContentType: 'application/json',
    };
    const action = clearResponse();
    const newState = reducer(previousState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.error).toBeNull();
    expect(newState.responseData).toBeNull();
    expect(newState.responseStatus).toBeNull();
    expect(newState.responseContentType).toBeNull();
    expect(newState.method).toBe(previousState.method);
    expect(newState.url).toBe(previousState.url);
  });

  it('should handle clearAllRequestState', () => {
    const previousState: RestClientState = {
      method: 'POST',
      url: 'http://some.url/path?a=1',
      requestBody: '{"data": true}',
      bodyLanguage: 'plaintext',
      headers: [{ id: 'h1', key: 'X-H', value: 'val' }],
      queryParams: [{ id: 'p1', key: 'a', value: '1' }],
      isLoading: true,
      error: 'Err',
      responseData: 'Data',
      responseStatus: 404,
      responseContentType: 'text/plain',
      activeTab: 'body',
    };
    const action = clearAllRequestState();
    const newState = reducer(previousState, action);

    const cleanInitial = getCleanInitialState();
    expect(newState.method).toBe(cleanInitial.method);
    expect(newState.url).toBe(cleanInitial.url);
    expect(newState.requestBody).toBe(cleanInitial.requestBody);
    expect(newState.isLoading).toBe(cleanInitial.isLoading);
    expect(newState.error).toBe(cleanInitial.error);
    expect(newState.responseData).toBe(cleanInitial.responseData);
    expect(newState.responseStatus).toBe(cleanInitial.responseStatus);
    expect(newState.headers).toHaveLength(1);
    expect(newState.headers[0].key).toBe('');
    expect(newState.headers[0].value).toBe('');
    expect(newState.queryParams).toHaveLength(1);
    expect(newState.queryParams[0].key).toBe('');
    expect(newState.queryParams[0].value).toBe('');
  });
});
describe('restClientSlice Async Thunk: sendRequest', () => {
  let dispatch: ReturnType<typeof vi.fn>;
  let getState: ReturnType<typeof vi.fn>;
  let mockRootState: RootState;

  beforeEach(() => {
    uuidCounter = 0;
    dispatch = vi.fn();
    mockRootState = {
      variables: [
        { id: 'v1', key: 'baseUrl', value: 'https://api.mock.com' },
      ] as Variable[],
      restClient: { ...initialState },
      history: { items: [] },
    };
    getState = vi.fn().mockReturnValue(mockRootState);
    fetchMock.mockClear();
    interpolateVariablesMock.mockClear();
    interpolateVariablesMock.mockImplementation((str) => {
      if (str === '{{baseUrl}}/data') return 'https://api.mock.com/data';
      if (str === 'Bearer {{token}}') return 'Bearer mock-token';
      return str || '';
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful request (fulfilled)', async () => {
    const requestPayload: SendRequestPayload = {
      method: 'POST',
      targetUrl: '{{baseUrl}}/data',
      headers: [{ id: 'h1', key: 'Authorization', value: 'Bearer {{token}}' }],
      queryParams: [{ id: 'q1', key: 'test', value: 'true' }],
      body: '{"request": true}',
    };
    const mockProxyResponseBody = '{"success": true}';
    const mockProxyResponseStatus = 200;
    const mockProxyResponseHeaders = {
      'content-type': 'application/json; charset=utf-8',
    };
    const mockProxyResponse = {
      body: mockProxyResponseBody,
      status: mockProxyResponseStatus,
      headers: mockProxyResponseHeaders,
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        'content-type': mockProxyResponseHeaders['content-type'],
      }),
      json: async () => mockProxyResponse,
    });
    const result = await sendRequest(requestPayload)(
      dispatch,
      getState,
      undefined
    );

    expect(interpolateVariablesMock).toHaveBeenCalledWith(
      '{{baseUrl}}/data',
      mockRootState.variables
    );
    expect(interpolateVariablesMock).toHaveBeenCalledWith(
      'Bearer {{token}}',
      mockRootState.variables
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'POST',
        targetUrl: 'https://api.mock.com/data',
        headers: [
          { id: 'h1', key: 'Authorization', value: 'Bearer mock-token' },
        ],
        queryParams: requestPayload.queryParams,
        body: requestPayload.body,
      }),
    });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      sendRequest.pending(expect.any(String), requestPayload)
    );

    const expectedFulfilledPayload: SendRequestSuccessPayload = {
      body: mockProxyResponseBody,
      status: mockProxyResponseStatus,
      headers: mockProxyResponseHeaders,
      contentType: mockProxyResponseHeaders['content-type'],
    };
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      sendRequest.fulfilled(
        expectedFulfilledPayload,
        expect.any(String),
        requestPayload
      )
    );
    expect(result.payload).toEqual(expectedFulfilledPayload);
    expect(result.type).toBe('restClient/sendRequest/fulfilled');
  });

  it('should handle API error (rejected with payload)', async () => {
    const requestPayload: SendRequestPayload = {
      method: 'POST',
      targetUrl: '{{baseUrl}}/data',
      headers: [],
      queryParams: [],
      body: '{}',
    };
    const mockErrorStatus = 400;
    const mockErrorStatusText = 'Bad Request';
    const mockErrorBody = '{"error":"Invalid input"}';
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: mockErrorStatus,
      statusText: mockErrorStatusText,
      headers: new Headers(),
      text: async () => mockErrorBody,
    });

    const result = await sendRequest(requestPayload)(
      dispatch,
      getState,
      undefined
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      sendRequest.pending(expect.any(String), requestPayload)
    );
    const expectedRejectPayload: RejectPayload = {
      message: `Error ${mockErrorStatus}: ${mockErrorStatusText}`,
      status: mockErrorStatus,
      body: mockErrorBody,
    };
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      sendRequest.rejected(
        null,
        expect.any(String),
        requestPayload,
        expectedRejectPayload
      )
    );
    expect(result.payload).toEqual(expectedRejectPayload);
    expect(result.type).toBe('restClient/sendRequest/rejected');
  });

  it('should handle network error (rejected with error)', async () => {
    const requestPayload: SendRequestPayload = {
      method: 'POST',
      targetUrl: '{{baseUrl}}/data',
      headers: [],
      queryParams: [],
      body: '{}',
    };
    const networkErrorMessage = 'Failed to connect';
    fetchMock.mockRejectedValueOnce(new Error(networkErrorMessage));
    const result = await sendRequest(requestPayload)(
      dispatch,
      getState,
      undefined
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      sendRequest.pending(expect.any(String), requestPayload)
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: sendRequest.rejected.type,
        payload: {
          message: networkErrorMessage,
          status: 500,
          body: null,
        },
        error: expect.objectContaining({ message: 'Rejected' }),
      })
    );
    expect(result.payload).toEqual({
      message: networkErrorMessage,
      status: 500,
      body: null,
    });
    expect(result.type).toBe('restClient/sendRequest/rejected');
  });

  it('should reject immediately if method is GET/HEAD and body is present', async () => {
    const requestPayload: SendRequestPayload = {
      method: 'GET',
      targetUrl: '{{baseUrl}}/data',
      headers: [],
      queryParams: [],
      body: '{"forbidden": true}',
    };
    const result = await sendRequest(requestPayload)(
      dispatch,
      getState,
      undefined
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      sendRequest.pending(expect.any(String), requestPayload)
    );
    const expectedRejectPayload: RejectPayload = {
      message: 'Request body is not allowed for GET/HEAD methods',
      status: 400,
      body: 'Request body is not allowed for GET/HEAD methods. Please clear the request body.',
    };
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: sendRequest.rejected.type,
        payload: expectedRejectPayload,
        error: expect.objectContaining({ message: 'Rejected' }),
      })
    );
    expect(result.payload).toEqual(expectedRejectPayload);
    expect(result.type).toBe('restClient/sendRequest/rejected');
  });

  it('should handle interpolation error (rejected with error)', async () => {
    const requestPayload: SendRequestPayload = {
      method: 'POST',
      targetUrl: '{{badVar}}/data',
      headers: [],
      queryParams: [],
      body: '{}',
    };
    const interpolationErrorMsg = 'Variable {{badVar}} not found';
    interpolateVariablesMock.mockImplementation(() => {
      throw new Error(interpolationErrorMsg);
    });

    const result = await sendRequest(requestPayload)(
      dispatch,
      getState,
      undefined
    );

    expect(interpolateVariablesMock).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      sendRequest.pending(expect.any(String), requestPayload)
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: sendRequest.rejected.type,
        payload: undefined,
        error: expect.objectContaining({ message: interpolationErrorMsg }),
      })
    );
    expect(result.type).toBe('restClient/sendRequest/rejected');
    expect(result.payload).toBeUndefined();
  });
});

describe('restClientSlice extraReducers', () => {
  beforeEach(() => {
    uuidCounter = 0;
  });

  it('should handle sendRequest.pending', () => {
    const previousState: RestClientState = {
      ...getCleanInitialState(),
      error: 'Previous error',
    };
    const action = sendRequest.pending(
      'mockRequestId',
      {} as SendRequestPayload
    );
    const newState = reducer(previousState, action);

    expect(newState.isLoading).toBe(true);
    expect(newState.error).toBeNull();
    expect(newState.responseData).toBeNull();
    expect(newState.responseStatus).toBeNull();
    expect(newState.responseContentType).toBeNull();
  });

  it('should handle sendRequest.fulfilled', () => {
    const previousState: RestClientState = {
      ...getCleanInitialState(),
      isLoading: true,
    };
    const mockSuccessPayload: SendRequestSuccessPayload = {
      body: '{"data":"ok"}',
      status: 201,
      headers: { 'x-request-id': 'abc' },
      contentType: 'application/json',
    };
    const action = sendRequest.fulfilled(
      mockSuccessPayload,
      'mockRequestId',
      {} as SendRequestPayload
    );
    const newState = reducer(previousState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.error).toBeNull();
    expect(newState.responseData).toBe(mockSuccessPayload.body);
    expect(newState.responseStatus).toBe(mockSuccessPayload.status);
    expect(newState.responseContentType).toBe(mockSuccessPayload.contentType);
  });

  it('should handle sendRequest.rejected (from API error)', () => {
    const previousState: RestClientState = {
      ...getCleanInitialState(),
      isLoading: true,
    };
    const mockRejectPayload: RejectPayload = {
      message: 'Error 400: Bad Request',
      status: 400,
      body: '{"error":"details"}',
    };
    const action = sendRequest.rejected(
      null,
      'mockRequestId',
      {} as SendRequestPayload,
      mockRejectPayload
    );
    const newState = reducer(previousState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.error).toBe(mockRejectPayload.message);
    expect(newState.responseStatus).toBe(mockRejectPayload.status);
    expect(newState.responseData).toBe(mockRejectPayload.body);
    expect(newState.responseContentType).toBeNull();
  });

  it('should handle sendRequest.rejected (from network error)', () => {
    const previousState: RestClientState = {
      ...getCleanInitialState(),
      isLoading: true,
    };
    const mockError = new Error('Network Failure');
    const action = sendRequest.rejected(
      mockError,
      'mockRequestId',
      {} as SendRequestPayload
    );
    const newState = reducer(previousState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.error).toBe(mockError.message);
    expect(newState.responseStatus).toBeNull();
    expect(newState.responseData).toBeNull();
    expect(newState.responseContentType).toBeNull();
  });
});
