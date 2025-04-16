import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';
import HistoryItem from './HistoryItem';
import type {
  HistoryItem as HistoryItemType,
  Variable,
} from '@/app/interfaces';
import * as EncodingHelper from '@/app/components/rest-client/helpers/encoding';
import * as InterpolationHelper from '@/app/components/variables/helpers/interpolate';

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});
const useSelectorMock = vi.mocked(useSelector);

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

const encodeToBase64UrlMock = vi
  .spyOn(EncodingHelper, 'encodeToBase64Url')
  .mockImplementation((str: string) => `encoded(${str})`);
const interpolateVariablesMock = vi
  .spyOn(InterpolationHelper, 'interpolateVariables')
  .mockImplementation((str: string | null | undefined) => str || '');

const mockItem: HistoryItemType = {
  id: 'hist-123',
  timestamp: new Date('2024-01-10T10:30:00Z').getTime(),
  method: 'POST',
  url: 'https://api.example.com/{{resource}}',
  headers: [{ key: 'Content-Type', value: 'application/json' }],
  queryParams: [],
  body: '{"id": "{{userId}}"}',
  bodyLanguage: 'json',
};

const mockVariables: Variable[] = [
  { id: 'v1', key: 'resource', value: 'items' },
  { id: 'v2', key: 'userId', value: 'user-abc' },
];

describe('HistoryItem Component', () => {
  const mockOnDelete = vi.fn();
  const mockCallback = vi.fn();

  beforeEach(() => {
    useSelectorMock.mockReturnValue(mockVariables);
    mockOnDelete.mockClear();
    mockCallback.mockClear();
    encodeToBase64UrlMock.mockClear();
    interpolateVariablesMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render history item data correctly', () => {
    interpolateVariablesMock.mockImplementation((str, _vars) => {
      if (str === mockItem.url) return 'https://api.example.com/items';
      return str || '';
    });

    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        callback={mockCallback}
        translations={{
          method: '',
          url: '',
          time: '',
          bodyType: '',
          copyTooltip: '',
        }}
      />
    );

    expect(screen.getByText(mockItem.method)).toBeInTheDocument();
    const methodSpan = screen.getByText(mockItem.method);
    expect(methodSpan).toHaveClass('bg-chart-4');
    const expectedDate = new Date(mockItem.timestamp).toLocaleString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
    expect(interpolateVariablesMock).toHaveBeenCalledWith(
      mockItem.url,
      mockVariables
    );
    expect(
      screen.getByText('https://api.example.com/items')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Delete history item')).toBeInTheDocument();
  });

  it('should generate the correct href for the Link component', () => {
    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        callback={mockCallback}
        translations={{
          method: '',
          url: '',
          time: '',
          bodyType: '',
          copyTooltip: '',
        }}
      />
    );

    const linkElement = screen.getByRole('link');
    const params = new URLSearchParams();
    mockItem.headers.forEach((header) => {
      params.set(header.key, header.value);
    });
    const encodedUrl = EncodingHelper.encodeToBase64Url(mockItem.url);
    const encodedBody = mockItem.body
      ? `/${EncodingHelper.encodeToBase64Url(mockItem.body)}`
      : '';
    const expectedHref = `/${mockItem.method}/${encodedUrl}${encodedBody}?${params.toString()}`;
    expect(linkElement).toHaveAttribute('href', expectedHref);
    expect(encodeToBase64UrlMock).toHaveBeenCalledWith(mockItem.url);
    if (mockItem.body) {
      expect(encodeToBase64UrlMock).toHaveBeenCalledWith(mockItem.body);
    }
  });
  it('should call the callback function when the link is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        callback={mockCallback}
        translations={{
          method: '',
          url: '',
          time: '',
          bodyType: '',
          copyTooltip: '',
        }}
      />
    );

    const linkElement = screen.getByRole('link');
    await user.click(linkElement);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should call the onDelete function with item id when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        callback={mockCallback}
        translations={{
          method: '',
          url: '',
          time: '',
          bodyType: '',
          copyTooltip: '',
        }}
      />
    );
    const deleteButton = screen.getByLabelText('Delete history item');
    await user.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockItem.id);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
