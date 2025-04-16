import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import MethodSelector from './MethodSelector';
import { methods, MethodProps } from '@/app/interfaces';

vi.mock('@heroicons/react/16/solid', () => ({
  ChevronUpDownIcon: vi.fn(() => <div data-testid="icon-chevron" />),
}));
vi.mock('@heroicons/react/20/solid', () => ({
  CheckIcon: vi.fn(() => <div data-testid="icon-check" />),
}));

const MockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

window.ResizeObserver = MockResizeObserver;

describe('MethodSelector Component', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let defaultProps: MethodProps;

  beforeEach(() => {
    vi.resetAllMocks();
    mockOnChange = vi.fn();
    defaultProps = {
      value: 'GET',
      onChange: mockOnChange,
    };
  });

  it('should render the listbox button with initial value and chevron icon', () => {
    render(<MethodSelector {...defaultProps} />);

    const listboxButton = screen.getByRole('button', { name: /get/i });
    expect(listboxButton).toBeInTheDocument();
    expect(
      within(listboxButton).getByText(defaultProps.value)
    ).toBeInTheDocument();

    expect(
      within(listboxButton).getByTestId('icon-chevron')
    ).toBeInTheDocument();
  });

  it('should initially not show the options list', () => {
    render(<MethodSelector {...defaultProps} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should show options list when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<MethodSelector {...defaultProps} />);

    const listboxButton = screen.getByRole('button', { name: /get/i });
    await user.click(listboxButton);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(methods.length);

    for (const method of methods) {
      expect(
        within(listbox).getByRole('option', { name: method })
      ).toBeInTheDocument();
    }
  });
});
