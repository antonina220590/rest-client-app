import { describe, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from './Header';

vi.mock('@/app/firebase/config', () => ({
  auth: {},
}));

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: vi.fn(() => '/en'),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe('render Header component', () => {
  it('Sign In and Sign Up when user is not authenticated', async () => {
    (useAuthState as ReturnType<typeof vi.fn>).mockImplementation(() => [null]);

    await act(async () => {
      render(<Header />);
    });

    expect(screen.getByRole('button', { name: /signIn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signUp/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should change header opacity and padding on scroll', async () => {
    (useAuthState as ReturnType<typeof vi.fn>).mockImplementation(() => [
      { uid: '123' },
    ]);

    render(<Header />);

    const header = screen.getByRole('banner');

    expect(header).not.toHaveClass('py-1');

    await act(async () => {
      Object.defineProperty(window, 'scrollY', {
        value: 300,
        writable: true,
      });

      window.dispatchEvent(new Event('scroll'));

      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(header).toHaveClass('py-1');
  });
});
