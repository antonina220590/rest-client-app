import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LgSwitcher';

const push = vi.fn();
let mockPathname = '/en/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => mockPathname,
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/en/page';
  });

  it('renders with English selected by default', () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });

  it('calls router.push with correct path when language changes', () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ru' } });

    expect(select).toHaveValue('ru');
    expect(push).toHaveBeenCalledWith('/ru/page');
  });
});
