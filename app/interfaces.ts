export interface KeyValueItem {
  id: string;
  key: string;
  value?: string;
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
}

export type BodyLanguage = 'json' | 'plaintext';

export interface RequestResponseAreaProps {
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
  bodyLanguage: BodyLanguage;
  onBodyLanguageChange: (lang: BodyLanguage) => void;
  responseData: string | null;
  responseContentType: string | null;
  responseStatus: number | null;
  isLoading: boolean;
}

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
