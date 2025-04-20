import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LgSwitcher';

const push = vi.fn();
const replace = vi.fn();
let mockPathname = '/en/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: push,
    replace: replace,
  }),
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

  it('calls router.replace with correct path when language changes', () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'ru' } });
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/ru/page');
    expect(push).not.toHaveBeenCalled();
  });
  it('calculates path correctly when starting from /ru', () => {
    mockPathname = '/ru/other-page';
    render(<LanguageSwitcher />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'en' } });

    expect(replace).toHaveBeenCalledTimes(1);
  });
});
