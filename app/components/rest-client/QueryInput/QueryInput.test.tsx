import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import QueryInputs from './QueryInput';
import type { KeyValueRowProps } from '@/app/interfaces';

vi.mock('lucide-react', () => ({
  Trash2: vi.fn(() => <div data-testid="icon-trash" />),
}));

vi.mock('@/components/ui/input', () => ({
  Input: vi.fn((props) => <input {...props} />),
}));
vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }) => (
    <button {...props}>{children}</button>
  )),
}));

describe('QueryInputs Component', () => {
  let mockOnKeyChange: ReturnType<typeof vi.fn>;
  let mockOnValueChange: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;
  let defaultProps: KeyValueRowProps;

  const testId = 'row-123';

  beforeEach(() => {
    vi.resetAllMocks();
    mockOnKeyChange = vi.fn();
    mockOnValueChange = vi.fn();
    mockOnDelete = vi.fn();

    defaultProps = {
      id: testId,
      itemKey: '',
      itemValue: '',
      onKeyChange: mockOnKeyChange,
      onValueChange: mockOnValueChange,
      onDelete: mockOnDelete,
    };
  });

  it('should render two input fields and a delete button', () => {
    render(<QueryInputs {...defaultProps} />);

    const keyInput = screen.getByPlaceholderText('Key');
    const valueInput = screen.getByPlaceholderText('Value');
    const deleteButton = screen.getByRole('button', { name: /delete row/i });

    expect(keyInput).toBeInTheDocument();
    expect(valueInput).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(within(deleteButton).getByTestId('icon-trash')).toBeInTheDocument();
  });

  it('should display default placeholders', () => {
    render(<QueryInputs {...defaultProps} />);

    expect(screen.getByPlaceholderText('Key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument();
  });

  it('should display custom placeholders when provided', () => {
    const customKeyPlaceholder = 'Parameter Name';
    const customValuePlaceholder = 'Parameter Value';
    render(
      <QueryInputs
        {...defaultProps}
        keyPlaceholder={customKeyPlaceholder}
        valuePlaceholder={customValuePlaceholder}
      />
    );

    expect(
      screen.getByPlaceholderText(customKeyPlaceholder)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(customValuePlaceholder)
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Key')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Value')).not.toBeInTheDocument();
  });

  it('should display initial key and value', () => {
    const initialKey = 'user_id';
    const initialValue = 'abc987';
    render(
      <QueryInputs
        {...defaultProps}
        itemKey={initialKey}
        itemValue={initialValue}
      />
    );

    const keyInput = screen.getByPlaceholderText('Key') as HTMLInputElement;
    const valueInput = screen.getByPlaceholderText('Value') as HTMLInputElement;

    expect(keyInput.value).toBe(initialKey);
    expect(valueInput.value).toBe(initialValue);
  });
});
