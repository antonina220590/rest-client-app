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

describe('render Header component', () => {
  it('Sign In and Sign Up when user is not authenticated', async () => {
    (useAuthState as ReturnType<typeof vi.fn>).mockImplementation(() => [null]);

    await act(async () => {
      render(<Header />);
    });

    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('Sign Out when user is authenticated', async () => {
    (useAuthState as ReturnType<typeof vi.fn>).mockImplementation(() => [
      { uid: '123' },
    ]);

    await act(async () => {
      render(<Header />);
    });

    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
