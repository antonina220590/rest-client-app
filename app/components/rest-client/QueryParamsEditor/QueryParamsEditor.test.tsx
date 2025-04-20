import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QueryParamsEditor from './QueryParamsEditor';
import type { QueryParam, KeyValueItem } from '@/app/interfaces';

vi.mock('lucide-react', () => ({
  Plus: vi.fn(() => <div data-testid="icon-plus" />),
  Trash2: vi.fn(() => <div data-testid="icon-trash" />),
}));

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
}));

vi.mock('../QueryInputs/QueryInputs', () => ({
  default: vi.fn(
    ({ id, itemKey, itemValue, keyPlaceholder, valuePlaceholder }) => (
      <div data-testid={`mock-query-input-${id}`}>
        <span data-testid="key-prop">{itemKey}</span>
        <span data-testid="value-prop">{itemValue}</span>
        <span data-testid="key-placeholder-prop">{keyPlaceholder}</span>
        <span data-testid="value-placeholder-prop">{valuePlaceholder}</span>
      </div>
    )
  ),
}));

describe('QueryParamsEditor Component', () => {
  let mockOnAddItem: Mock;
  let mockOnItemKeyChange: Mock;
  let mockOnItemValueChange: Mock;
  let mockOnDeleteItem: Mock;
  let defaultProps: QueryParam;
  const testItems: KeyValueItem[] = [
    { id: 'id1', key: 'key1', value: 'value1' },
    { id: 'id2', key: 'key2', value: 'value2' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockOnAddItem = vi.fn();
    mockOnItemKeyChange = vi.fn();
    mockOnItemValueChange = vi.fn();
    mockOnDeleteItem = vi.fn();

    defaultProps = {
      items: testItems,
      onAddItem: mockOnAddItem,
      onItemKeyChange: mockOnItemKeyChange,
      onItemValueChange: mockOnItemValueChange,
      onDeleteItem: mockOnDeleteItem,
    };
  });

  it('should render correct number of QueryInputs based on items array', () => {
    render(<QueryParamsEditor {...defaultProps} />);
    const renderedItems = screen.getAllByTestId(/^mock-query-input-/);
    expect(renderedItems).toHaveLength(testItems.length);
    expect(screen.getByTestId('mock-query-input-id1')).toBeInTheDocument();
    expect(screen.getByTestId('mock-query-input-id2')).toBeInTheDocument();
  });

  it('should render the Add button with default label', () => {
    render(<QueryParamsEditor {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: /add item/i });
    expect(addButton).toBeInTheDocument();
    expect(within(addButton).getByTestId('icon-plus')).toBeInTheDocument();
  });

  it('should render the Add button with custom label', () => {
    const customLabel = 'Add New Parameter';
    render(
      <QueryParamsEditor {...defaultProps} addButtonLabel={customLabel} />
    );
    const addButton = screen.getByRole('button', { name: customLabel });
    expect(addButton).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /add item/i })
    ).not.toBeInTheDocument();
  });

  it('should render nothing for items list when items array is empty', () => {
    render(<QueryParamsEditor {...defaultProps} items={[]} />);
    const renderedItems = screen.queryAllByTestId(/^mock-query-input-/);
    expect(renderedItems).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: /add item/i })
    ).toBeInTheDocument();
  });

  it('should call onAddItem when the Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<QueryParamsEditor {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add item/i });
    await user.click(addButton);

    expect(mockOnAddItem).toHaveBeenCalledTimes(1);
  });
});
