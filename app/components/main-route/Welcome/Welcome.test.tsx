import { render, screen } from '@testing-library/react';
import Welcome from './Welcome';
import { vi } from 'vitest';
import { useAuthState as mockUseAuthState } from 'react-firebase-hooks/auth';
import { getCookie as mockGetCookie } from 'cookies-next';

vi.mock('@/app/firebase/config', () => ({
  auth: {},
}));

vi.mock('react-firebase-hooks/auth', async () => {
  return {
    useAuthState: vi.fn(),
  };
});

vi.mock('cookies-next', () => ({
  getCookie: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string, params?: { name?: string }) => {
    if (key === 'welcomeBack') {
      return `Welcome back, ${params?.name}!`;
    }
    return key;
  }),
}));

describe('Welcome component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should contain an h2 tag', () => {
    (mockUseAuthState as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
      null,
      false,
    ]);
    (mockGetCookie as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      null
    );

    render(<Welcome />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
