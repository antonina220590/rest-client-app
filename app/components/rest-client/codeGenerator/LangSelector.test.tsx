// tests/LangSelector.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LangSelector from './LangSelector';
import { type LangProps, langs } from '@/app/interfaces';

const MockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', MockResizeObserver);

describe('LangSelector Component', () => {
  type MockOnChange = (value: string) => void;
  let mockOnChange: MockOnChange;
  let defaultProps: LangProps;

  beforeEach(() => {
    mockOnChange = vi.fn();

    defaultProps = {
      value: langs[0],
      onChange: mockOnChange,
    };
    vi.clearAllMocks();
  });

  it('should render the listbox button displaying the current value', () => {
    const initialLangValue = 'curl';
    render(<LangSelector {...defaultProps} value={initialLangValue} />);
    const listboxButton = screen.getByRole('button', {
      name: initialLangValue,
    });
    expect(listboxButton).toBeInTheDocument();
  });
});
