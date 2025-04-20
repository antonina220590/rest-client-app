import { render, screen } from '@testing-library/react';
import AboutUs from './AboutUs';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

describe('AboutUs component', () => {
  it('should comtain an h2 tag', () => {
    render(<AboutUs />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
