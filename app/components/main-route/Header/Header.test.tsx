import { describe, expect, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
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

  it('Sign Out when user is authenticated', async () => {
    (useAuthState as ReturnType<typeof vi.fn>).mockImplementation(() => [
      { uid: '123' },
    ]);

    await act(async () => {
      render(<Header />);
    });

    expect(
      screen.getByRole('button', { name: /signOut/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should change header opacity and padding on scroll', async () => {
    (useAuthState as ReturnType<typeof vi.fn>).mockImplementation(() => [
      { uid: '123' },
    ]);

    await act(async () => {
      render(<Header />);
    });

    Object.defineProperty(window, 'scrollY', {
      value: 300,
      writable: true,
    });

    window.dispatchEvent(new Event('scroll'));

    const header = screen.getByRole('banner');

    await waitFor(() => {
      expect(header).toHaveClass('opacity-50');
      expect(header).toHaveClass('py-1');
    });
  });
});
