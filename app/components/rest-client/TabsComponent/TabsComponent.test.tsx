import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';

import TabsComponent from './TabsComponent';
import type { TabsComponentProps, KeyValueItem } from '@/app/interfaces';

vi.mock('next-intl', () => ({
  useTranslations: (_namespace: string) => (key: string) => key,
}));

vi.mock('@/components/ui/card', () => ({
  Card: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

vi.mock('../QueryParamsEditor/QueryParamsEditor', () => ({
  default: vi.fn(
    ({ items, addButtonLabel, keyInputPlaceholder, valueInputPlaceholder }) => (
      <div data-testid="mock-query-params-editor">
        <span data-testid="items-count">{items?.length ?? 0}</span>
        <span data-testid="add-button-label">{addButtonLabel}</span>
        <span data-testid="key-placeholder">{keyInputPlaceholder}</span>
        <span data-testid="value-placeholder">{valueInputPlaceholder}</span>
        {items?.map((item: KeyValueItem) => (
          <span key={item.id} data-testid={`item-${item.id}`}></span>
        ))}
      </div>
    )
  ),
}));

vi.mock('../BodyEditor/BodyEditor', () => ({
  default: vi.fn(
    ({ value, language, showPrettifyButton, showLanguageSelector }) => (
      <div data-testid="mock-request-body-editor">
        <span data-testid="body-value">{value}</span>
        <span data-testid="body-language">{language}</span>
        <span data-testid="body-prettify-btn">
          {String(showPrettifyButton)}
        </span>
        <span data-testid="body-lang-selector">
          {String(showLanguageSelector)}
        </span>
      </div>
    )
  ),
}));

vi.mock('@/app/components/variables/VariablesListWrapper', () => ({
  default: vi.fn(() => (
    <div data-testid="mock-variables-list-wrapper">Variables List Mock</div>
  )),
}));

describe('TabsComponent', () => {
  let mockOnValueChange: Mock;
  let mockOnAddQueryParam: Mock;
  let mockOnQueryParamKeyChange: Mock;
  let mockOnQueryParamValueChange: Mock;
  let mockOnDeleteQueryParam: Mock;
  let mockOnAddHeader: Mock;
  let mockOnHeaderKeyChange: Mock;
  let mockOnHeaderValueChange: Mock;
  let mockOnDeleteHeader: Mock;
  let mockOnBodyChange: Mock;
  let mockOnBodyLanguageChange: Mock;
  let defaultProps: TabsComponentProps;

  const queryItems: KeyValueItem[] = [
    { id: 'q1', key: 'queryKey', value: 'queryValue' },
  ];
  const headerItems: KeyValueItem[] = [
    { id: 'h1', key: 'headerKey', value: 'headerValue' },
  ];
  const bodyValue = '{"message": "hello"}';

  beforeEach(() => {
    vi.resetAllMocks();
    mockOnValueChange = vi.fn();
    mockOnAddQueryParam = vi.fn();
    mockOnQueryParamKeyChange = vi.fn();
    mockOnQueryParamValueChange = vi.fn();
    mockOnDeleteQueryParam = vi.fn();
    mockOnAddHeader = vi.fn();
    mockOnHeaderKeyChange = vi.fn();
    mockOnHeaderValueChange = vi.fn();
    mockOnDeleteHeader = vi.fn();
    mockOnBodyChange = vi.fn();
    mockOnBodyLanguageChange = vi.fn();

    defaultProps = {
      value: 'query',
      onValueChange: mockOnValueChange,
      queryParams: queryItems,
      onAddQueryParam: mockOnAddQueryParam,
      onQueryParamKeyChange: mockOnQueryParamKeyChange,
      onQueryParamValueChange: mockOnQueryParamValueChange,
      onDeleteQueryParam: mockOnDeleteQueryParam,
      headers: headerItems,
      onAddHeader: mockOnAddHeader,
      onHeaderKeyChange: mockOnHeaderKeyChange,
      onHeaderValueChange: mockOnHeaderValueChange,
      onDeleteHeader: mockOnDeleteHeader,
      requestBody: bodyValue,
      onBodyChange: mockOnBodyChange,
      bodyLanguage: 'json',
      onBodyLanguageChange: mockOnBodyLanguageChange,
      showPrettifyButton: true,
      showLanguageSelector: true,
    };
  });

  it('should render tab triggers with correct labels', () => {
    render(<TabsComponent {...defaultProps} />);
    expect(screen.getByRole('tab', { name: 'query' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'headers' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'body' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'variables' })).toBeInTheDocument();
  });

  it('should render content for the initially active tab only', () => {
    render(<TabsComponent {...defaultProps} value="query" />);
    expect(screen.getByTestId('mock-query-params-editor')).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-request-body-editor')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-variables-list-wrapper')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('item-q1')).toBeInTheDocument();
    expect(screen.queryByTestId('item-h1')).not.toBeInTheDocument();
  });

  it('should render body content when "body" tab is initially active', () => {
    render(<TabsComponent {...defaultProps} value="body" />);
    expect(screen.getByTestId('mock-request-body-editor')).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-query-params-editor')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-variables-list-wrapper')
    ).not.toBeInTheDocument();
  });

  it('should render variables content when "variables" tab is initially active', () => {
    render(<TabsComponent {...defaultProps} value="variables" />);
    expect(
      screen.getByTestId('mock-variables-list-wrapper')
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-query-params-editor')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('mock-request-body-editor')
    ).not.toBeInTheDocument();
  });
});
