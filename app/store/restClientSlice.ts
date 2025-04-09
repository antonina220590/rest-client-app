import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { KeyValueItem, BodyLanguage } from '@/app/interfaces';
import { RootState } from './store';
import { buildUrlWithParams } from '../components/rest-client/helpers/urlBuilder';

interface RestClientState {
  method: string;
  url: string;
  requestBody: string;
  bodyLanguage: BodyLanguage;
  headers: KeyValueItem[];
  queryParams: KeyValueItem[];
  isLoading: boolean;
  error: string | null;
  responseData: string | null;
  responseStatus: number | null;
  responseContentType: string | null;
}

const initialState: RestClientState = {
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
};

interface SendRequestPayload {
  method: string;
  targetUrl: string;
  headers: KeyValueItem[];
  queryParams: KeyValueItem[];
  body: string | null;
}

interface SendRequestSuccessPayload {
  body: string | null;
  status: number;
  headers: Record<string, string>;
  contentType: string | null;
}

interface RejectPayload {
  message: string;
  status?: number;
  body: string | null;
}

export const sendRequest = createAsyncThunk<
  SendRequestSuccessPayload,
  SendRequestPayload,
  { rejectValue: RejectPayload }
>('restClient/sendRequest', async (requestData, thunkAPI) => {
  let cleanTargetUrl = requestData.targetUrl;
  try {
    const urlObject = new URL(requestData.targetUrl);
    cleanTargetUrl = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;
  } catch {}

  const proxyPayload = {
    method: requestData.method,
    targetUrl: cleanTargetUrl,
    headers: requestData.headers.filter((h) => h.key),
    queryParams: requestData.queryParams.filter((p) => p.key),
    body: requestData.body,
  };

  try {
    const response = await fetch('/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proxyPayload),
    });
    const responseStatus = response.status;

    if (!response.ok) {
      let errorBody: string | null = null;
      let errorData = null;
      try {
        errorBody = await response.text();
        try {
          errorData = JSON.parse(errorBody);
        } catch {
          errorData = null;
        }
      } catch {
        errorBody = null;
        errorData = null;
      }

      const errorMessage = `Proxy Error ${responseStatus}: ${typeof errorData === 'object' && errorData?.message ? errorData.message : response.statusText || 'Unknown error'}`;
      return thunkAPI.rejectWithValue({
        message: errorMessage,
        status: responseStatus,
        body: errorBody,
      });
    }
    const proxyResponse = await response.json();

    if (proxyResponse.error) {
      return thunkAPI.rejectWithValue({
        message: proxyResponse.error,
        status: proxyResponse.status || 500,
        body: proxyResponse.body ?? null,
      });
    }

    const contentTypeHeader = proxyResponse.headers
      ? (Object.entries(proxyResponse.headers).find(
          ([key]) => key.toLowerCase() === 'content-type'
        ) as [string, string] | undefined)
      : undefined;
    const contentType = contentTypeHeader ? contentTypeHeader[1] : null;

    return {
      body: proxyResponse.body ?? null,
      status: proxyResponse.status,
      headers: proxyResponse.headers || {},
      contentType: contentType,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown network error occurred';
    return thunkAPI.rejectWithValue({
      message: message,
      status: 500,
      body: null,
    });
  }
});

const parseQueryParamsFromUrl = (url: string): KeyValueItem[] => {
  const params: KeyValueItem[] = [];
  try {
    const urlObject = new URL(url);
    const uniqueKeys = new Set<string>();
    urlObject.searchParams.forEach((value, key) => {
      if (!uniqueKeys.has(key)) {
        params.push({ id: crypto.randomUUID(), key, value });
        uniqueKeys.add(key);
      }
    });
  } catch {}
  return params.length > 0
    ? params
    : [{ id: crypto.randomUUID(), key: '', value: '' }];
};

const restClientSlice = createSlice({
  name: 'restClient',
  initialState,
  reducers: {
    setMethod(state, action: PayloadAction<string>) {
      state.method = action.payload;
    },
    setUrl(state, action: PayloadAction<string>) {
      state.url = action.payload;
      state.queryParams = parseQueryParamsFromUrl(action.payload);
    },
    setRequestBody(state, action: PayloadAction<string>) {
      state.requestBody = action.payload;
    },
    setBodyLanguage(state, action: PayloadAction<BodyLanguage>) {
      state.bodyLanguage = action.payload;
    },
    setHeaders(state, action: PayloadAction<KeyValueItem[]>) {
      state.headers =
        action.payload.length > 0
          ? action.payload
          : [{ id: crypto.randomUUID(), key: '', value: '' }];
    },
    addHeader(state) {
      state.headers.push({ id: crypto.randomUUID(), key: '', value: '' });
    },
    updateHeaderKey(
      state,
      action: PayloadAction<{ id: string | number; key: string }>
    ) {
      const header = state.headers.find((h) => h.id === action.payload.id);
      if (header) header.key = action.payload.key;
    },
    updateHeaderValue(
      state,
      action: PayloadAction<{ id: string | number; value: string }>
    ) {
      const header = state.headers.find((h) => h.id === action.payload.id);
      if (header) header.value = action.payload.value;
    },
    deleteHeader(state, action: PayloadAction<string | number>) {
      state.headers = state.headers.filter((h) => h.id !== action.payload);
      if (state.headers.length === 0) {
        state.headers.push({ id: crypto.randomUUID(), key: '', value: '' });
      }
    },
    addQueryParam(state) {
      state.queryParams.push({ id: crypto.randomUUID(), key: '', value: '' });
      state.url = buildUrlWithParams(state.url, state.queryParams);
    },
    updateQueryParamKey(
      state,
      action: PayloadAction<{ id: string | number; key: string }>
    ) {
      const param = state.queryParams.find((p) => p.id === action.payload.id);
      if (param) {
        param.key = action.payload.key;
        state.url = buildUrlWithParams(state.url, state.queryParams);
      }
    },
    updateQueryParamValue(
      state,
      action: PayloadAction<{ id: string | number; value: string }>
    ) {
      const param = state.queryParams.find((p) => p.id === action.payload.id);
      if (param) {
        param.value = action.payload.value;
        state.url = buildUrlWithParams(state.url, state.queryParams);
      }
    },
    deleteQueryParam(state, action: PayloadAction<string | number>) {
      state.queryParams = state.queryParams.filter(
        (p) => p.id !== action.payload
      );
      if (state.queryParams.length === 0) {
        state.queryParams.push({ id: crypto.randomUUID(), key: '', value: '' });
      }
      state.url = buildUrlWithParams(state.url, state.queryParams);
    },
    setQueryParams(state, action: PayloadAction<KeyValueItem[]>) {
      state.queryParams =
        action.payload.length > 0
          ? action.payload
          : [{ id: crypto.randomUUID(), key: '', value: '' }];
      state.url = buildUrlWithParams(state.url, state.queryParams);
    },
    clearResponse(state) {
      state.isLoading = false;
      state.error = null;
      state.responseData = null;
      state.responseStatus = null;
      state.responseContentType = null;
    },
    clearAllRequestState(state) {
      state.method = initialState.method;
      state.url = initialState.url;
      state.requestBody = initialState.requestBody;
      state.bodyLanguage = initialState.bodyLanguage;
      state.headers = initialState.headers;
      state.queryParams = initialState.queryParams;
      state.isLoading = false;
      state.error = null;
      state.responseData = null;
      state.responseStatus = null;
      state.responseContentType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.responseData = null;
        state.responseStatus = null;
        state.responseContentType = null;
      })
      .addCase(
        sendRequest.fulfilled,
        (state, action: PayloadAction<SendRequestSuccessPayload>) => {
          state.isLoading = false;
          state.responseData = action.payload.body;
          state.responseStatus = action.payload.status;
          state.responseContentType = action.payload.contentType;
          state.error = null;
        }
      )
      .addCase(sendRequest.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
          state.responseStatus = action.payload.status ?? null;
          state.responseData = action.payload.body;
        } else {
          state.error = action.error.message ?? 'Request failed';
          state.responseStatus = null;
          state.responseData = null;
        }
        state.responseContentType = null;
      });
  },
});

export const {
  setMethod,
  setUrl,
  setRequestBody,
  setBodyLanguage,
  setHeaders,
  addHeader,
  updateHeaderKey,
  updateHeaderValue,
  deleteHeader,
  addQueryParam,
  updateQueryParamKey,
  updateQueryParamValue,
  deleteQueryParam,
  setQueryParams,
  clearResponse,
  clearAllRequestState,
} = restClientSlice.actions;

export default restClientSlice.reducer;

export type { RestClientState };
export const selectRestClientUrl = (state: RootState) => state.restClient.url;
export const selectRestClientIsLoading = (state: RootState) =>
  state.restClient.isLoading;
