import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlInput from './UrlInput';
import type { URLInputProps } from '@/app/interfaces';

vi.mock('next-intl', () => ({
  useTranslations: (_namespace: string) => (key: string) => key,
}));

describe('UrlInput Component', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnSend: ReturnType<typeof vi.fn>;
  let defaultProps: URLInputProps;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSend = vi.fn();
    defaultProps = {
      value: '',
      onChange: mockOnChange,
      onSend: mockOnSend,
    };
  });

  it('should render the input field and send button', () => {
    render(<UrlInput {...defaultProps} />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeInTheDocument();

    const buttonElement = screen.getByRole('button', { name: /send/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('should display the correct value in the input field', () => {
    const testValue = 'https://api.example.com/test';
    render(<UrlInput {...defaultProps} value={testValue} />);

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveValue(testValue);
  });

  it('should display the transformed value (decode {{ and }})', () => {
    const encodedValue = 'https://api.example.com/items/%7B%7Bid%7D%7D';
    const decodedValue = 'https://api.example.com/items/{{id}}';
    render(<UrlInput {...defaultProps} value={encodedValue} />);

    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveValue(decodedValue);
  });

  it('should call onChange handler when input value changes', async () => {
    const user = userEvent.setup();
    render(<UrlInput {...defaultProps} />);

    const inputElement = screen.getByRole('textbox');
    await user.type(inputElement, 'hello');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onSend handler when the send button is clicked', async () => {
    const user = userEvent.setup();
    render(<UrlInput {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /send/i });
    await user.click(buttonElement);

    expect(mockOnSend).toHaveBeenCalledTimes(1);
  });

  it('should have the correct type="text" for the input', () => {
    render(<UrlInput {...defaultProps} />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('type', 'text');
  });

  it('should have the correct type="submit" for the button (important for forms)', () => {
    render(<UrlInput {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /send/i });
    expect(buttonElement).toHaveAttribute('type', 'submit');
  });
});
