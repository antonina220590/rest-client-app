export interface KeyValueItem {
  id: string;
  key: string;
  value: string;
}

export interface TabsComponentProps {
  onTabChange: () => void;
  queryParams: KeyValueItem[];
  onAddQueryParam: () => void;
  onQueryParamKeyChange: (id: string | number, newKey: string) => void;
  onQueryParamValueChange: (id: string | number, newValue: string) => void;
  onDeleteQueryParam: (id: string | number) => void;
  headers: KeyValueItem[];
  onAddHeader: () => void;
  onHeaderKeyChange: (id: string | number, newKey: string) => void;
  onHeaderValueChange: (id: string | number, newValue: string) => void;
  onDeleteHeader: (id: string | number) => void;
  requestBody: string;
  onBodyChange: (value: string) => void;
  bodyLanguage: 'json' | 'plaintext';
  onBodyLanguageChange: (lang: 'json' | 'plaintext') => void;
  showPrettifyButton: boolean;
  showLanguageSelector: boolean;
  showVariablesTab?: boolean;
}

export type BodyLanguage = 'json' | 'plaintext';

export interface RequestBodyEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: BodyLanguage;
  readOnly?: boolean;
  onLanguageChange?: (language: BodyLanguage) => void;
  showPrettifyButton?: boolean;
  showLanguageSelector?: boolean;

  contentEditable: boolean;
}

export interface QueryParam {
  items: KeyValueItem[];
  onAddItem: () => void;
  onItemKeyChange: (id: string | number, newKey: string) => void;
  onItemValueChange: (id: string | number, newValue: string) => void;
  onDeleteItem: (id: string | number) => void;
  addButtonLabel?: string;
  keyInputPlaceholder?: string;
  valueInputPlaceholder?: string;
}

export const methods = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD',
];

export interface KeyValueRowProps {
  id: string | number;
  itemKey?: string;
  itemValue?: string;
  onKeyChange: (id: string | number, newKey: string) => void;
  onValueChange: (id: string | number, newValue: string) => void;
  onDelete: (id: string | number) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}
export type TranslateFunction = (key: string) => string;
export type ToastFunction = {
  success: (message: string, options?: object) => void;
  error: (message: string, options?: object) => void;
  info: (message: string, options?: object) => void;
};

export interface PrettifyJsonInputOptions {
  value: string;
  language: BodyLanguage;
  readOnly?: boolean;
  onChange: (newValue: string) => void;
  toast: ToastFunction;
  t: TranslateFunction;
}

export interface URLInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
}

export interface MethodProps {
  value: string;
  onChange: (value: string) => void;
}
export interface RestClientParams {
  locale: string;
  method: string;
  slug?: string[];
}

export interface RestClientSearchParams {
  [key: string]: string | string[] | undefined;
}

export interface RestClientPageProps {
  params: Promise<RestClientParams>;
  searchParams: Promise<RestClientSearchParams>;
}

export interface RestClientState {
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
export interface SendRequestPayload {
  method: string;
  targetUrl: string;
  headers: KeyValueItem[];
  queryParams: KeyValueItem[];
  body: string | null;
}

export interface SendRequestSuccessPayload {
  body: string | null;
  status: number;
  headers: Record<string, string>;
  contentType: string | null;
}

export interface RejectPayload {
  message: string;
  status?: number;
  body: string | null;
}

export interface ResizableContainerProps {
  initialMethod?: string;
  initialUrl?: string;
  initialBody?: string;
  initialHeaders?: KeyValueItem[];
}

export interface Variable {
  id: string;
  key: string;
  value: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface RootState {
  variables: Variable[];
  restClient: RestClientState;
  history: {
    items: HistoryItem[];
  };
}

export interface PreloadedState {
  variables: Variable[];
}

export type VariableItemProps = {
  variable: Variable;
  onEdit: (variable: Variable, field: 'key' | 'value') => void;
  onSave: (variable: Variable) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  editingId: string | null;
  editingField: 'key' | 'value' | null;
};

export interface HistoryItem {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  queryParams: Array<{ key: string; value: string }>;
  body: string;
  bodyLanguage: string;
}

export interface HistoryState {
  items: HistoryItem[];
}

export interface HistoryItemProps {
  item: HistoryItem;
  translations: {
    method: string;
    url: string;
    time: string;
    bodyType: string;
    copyTooltip: string;
  };
}
