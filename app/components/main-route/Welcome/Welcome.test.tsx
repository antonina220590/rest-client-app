import { render, screen } from '@testing-library/react';
import Welcome from './Welcome';

vi.mock('@/app/firebase/config', () => ({
  auth: {},
}));

vi.mock('react-firebase-hooks/auth', () => ({
  useAuthState: vi.fn(() => [null, false]),
}));

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe('Welcome component', () => {
  it('should contain an h2 tag', () => {
    render(<Welcome />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
