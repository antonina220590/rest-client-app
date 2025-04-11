import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  KeyValueItem,
  BodyLanguage,
  SendRequestSuccessPayload,
  SendRequestPayload,
  RejectPayload,
  RestClientState,
} from '@/app/interfaces';
import { RootState } from './store';
import { buildUrlWithParams } from '@/app/components/rest-client/helpers/urlBuilder';
import { interpolateVariables } from '@/app/components/variables/helpers/interpolate';

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
  activeTab: 'query',
  isCodePanelOpen: false,
};

const decodeTemplateVariables = (str: string): string => {
  return str.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');
};

export const sendRequest = createAsyncThunk<
  SendRequestSuccessPayload,
  SendRequestPayload,
  { rejectValue: RejectPayload; state: RootState }
>('restClient/sendRequest', async (payload, { getState, rejectWithValue }) => {
  const { variables } = getState();

  const methodUpper = payload.method.toUpperCase();
  if ((methodUpper === 'GET' || methodUpper === 'HEAD') && payload.body) {
    const errorPayload: RejectPayload = {
      message: 'Request body is not allowed for GET/HEAD methods',
      status: 400,
      body: 'Request body is not allowed for GET/HEAD methods. Please clear the request body.',
    };
    return rejectWithValue(errorPayload);
  }

  const processedHeaders = payload.headers
    .map((header) => ({
      ...header,
      key: interpolateVariables(decodeTemplateVariables(header.key), variables),
      value: interpolateVariables(
        decodeTemplateVariables(header.value),
        variables
      ),
    }))
    .filter((h) => h.key);

  const preparedRequest: SendRequestPayload = {
    ...payload,
    targetUrl: interpolateVariables(
      decodeTemplateVariables(payload.targetUrl),
      variables
    )
      .replace(/\/+/g, '/')
      .replace(/:\//, '://'),
    headers: processedHeaders,
    queryParams: payload.queryParams.map((p) => ({
      ...p,
      key: interpolateVariables(decodeTemplateVariables(p.key), variables),
      value: interpolateVariables(decodeTemplateVariables(p.value), variables),
    })),
    body: payload.body
      ? interpolateVariables(decodeTemplateVariables(payload.body), variables)
      : null,
  };

  let cleanTargetUrl = preparedRequest.targetUrl;
  try {
    const urlObject = new URL(cleanTargetUrl);
    cleanTargetUrl = `${urlObject.protocol}//${urlObject.host}${urlObject.pathname}`;
  } catch {}

  const proxyPayload = {
    method: preparedRequest.method,
    targetUrl: cleanTargetUrl,
    headers: processedHeaders,
    queryParams: preparedRequest.queryParams,
    body: preparedRequest.body,
  };

  try {
    const response = await fetch('/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proxyPayload),
    });

    if (!response.ok) {
      let errorBody: string | null = null;
      try {
        errorBody = await response.text();
      } catch {
        errorBody = null;
      }
      return rejectWithValue({
        message: `Error ${response.status}: ${response.statusText}`,
        status: response.status,
        body: errorBody,
      });
    }

    const proxyResponse = await response.json();
    const contentType = response.headers.get('content-type');

    return {
      body: proxyResponse.body ?? null,
      status: proxyResponse.status,
      headers: proxyResponse.headers || {},
      contentType: contentType,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return rejectWithValue({
      message,
      status: 500,
      body: null,
    });
  }
});

const parseQueryParamsFromUrl = (url: string): KeyValueItem[] => {
  const params: KeyValueItem[] = [];
  try {
    const urlObject = new URL(url);
    urlObject.searchParams.forEach((value, key) => {
      const decodedKey = decodeTemplateVariables(key);
      const decodedValue = decodeTemplateVariables(value);

      params.push({
        id: crypto.randomUUID(),
        key: decodedKey,
        value: decodedValue,
      });
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
    setMethod: (state, action: PayloadAction<string>) => {
      state.method = action.payload;
    },
    setUrl: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
      state.queryParams = parseQueryParamsFromUrl(action.payload);
    },
    setRequestBody: (state, action: PayloadAction<string>) => {
      state.requestBody = action.payload;
    },
    setBodyLanguage: (state, action: PayloadAction<BodyLanguage>) => {
      state.bodyLanguage = action.payload;
    },
    setHeaders: (state, action: PayloadAction<KeyValueItem[]>) => {
      state.headers =
        action.payload.length > 0
          ? action.payload
          : [{ id: crypto.randomUUID(), key: '', value: '' }];
    },
    addHeader: (state) => {
      state.headers.push({ id: crypto.randomUUID(), key: '', value: '' });
    },
    updateHeaderKey: (
      state,
      action: PayloadAction<{ id: string | number; key: string }>
    ) => {
      const header = state.headers.find((h) => h.id === action.payload.id);
      if (header) header.key = action.payload.key;
    },
    updateHeaderValue: (
      state,
      action: PayloadAction<{ id: string | number; value: string }>
    ) => {
      const header = state.headers.find((h) => h.id === action.payload.id);
      if (header) header.value = action.payload.value;
    },
    deleteHeader: (state, action: PayloadAction<string | number>) => {
      state.headers = state.headers.filter((h) => h.id !== action.payload);
      if (state.headers.length === 0) {
        state.headers.push({ id: crypto.randomUUID(), key: '', value: '' });
      }
    },
    addQueryParam: (state) => {
      state.queryParams.push({ id: crypto.randomUUID(), key: '', value: '' });
      state.url = buildUrlWithParams(state.url, state.queryParams);
    },
    updateQueryParamKey: (
      state,
      action: PayloadAction<{ id: string | number; key: string }>
    ) => {
      const param = state.queryParams.find((p) => p.id === action.payload.id);
      if (param) {
        param.key = action.payload.key;
        state.url = buildUrlWithParams(state.url, state.queryParams);
      }
    },
    updateQueryParamValue: (
      state,
      action: PayloadAction<{ id: string | number; value: string }>
    ) => {
      const param = state.queryParams.find((p) => p.id === action.payload.id);
      if (param) {
        param.value = action.payload.value;
        state.url = buildUrlWithParams(state.url, state.queryParams);
      }
    },
    deleteQueryParam: (state, action: PayloadAction<string | number>) => {
      state.queryParams = state.queryParams.filter(
        (p) => p.id !== action.payload
      );
      if (state.queryParams.length === 0) {
        state.queryParams.push({ id: crypto.randomUUID(), key: '', value: '' });
      }
      state.url = buildUrlWithParams(state.url, state.queryParams);
    },
    setQueryParams: (state, action: PayloadAction<KeyValueItem[]>) => {
      state.queryParams =
        action.payload.length > 0
          ? action.payload
          : [{ id: crypto.randomUUID(), key: '', value: '' }];
      state.url = buildUrlWithParams(state.url, state.queryParams);
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    toggleCodePanel(state) {
      state.isCodePanelOpen = !state.isCodePanelOpen;
    },
    setCodePanelOpen(state, action: PayloadAction<boolean>) {
      state.isCodePanelOpen = action.payload;
    },
    clearResponse: (state) => {
      state.isLoading = false;
      state.error = null;
      state.responseData = null;
      state.responseStatus = null;
      state.responseContentType = null;
    },
    clearAllRequestState: (state) => {
      Object.assign(state, initialState);
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
      .addCase(sendRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.responseData = action.payload.body;
        state.responseStatus = action.payload.status;
        state.responseContentType = action.payload.contentType;
      })
      .addCase(sendRequest.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.error = action.payload.message;
          state.responseStatus = action.payload.status ?? null;
          state.responseData = action.payload.body;
        } else {
          state.error = action.error.message ?? 'Request failed';
        }
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
  setActiveTab,
  toggleCodePanel,
  setCodePanelOpen,
} = restClientSlice.actions;

export default restClientSlice.reducer;

export const selectRestClient = (state: RootState) => state.restClient;
export const selectRestClientUrl = (state: RootState) => state.restClient.url;
export const selectRestClientIsLoading = (state: RootState) =>
  state.restClient.isLoading;
export const selectRestClientResponse = (state: RootState) => ({
  data: state.restClient.responseData,
  status: state.restClient.responseStatus,
  contentType: state.restClient.responseContentType,
  error: state.restClient.error,
});
export const selectIsCodePanelOpen = (state: RootState) =>
  state.restClient.isCodePanelOpen;
