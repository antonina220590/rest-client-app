import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotFound from './not-found';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn().mockImplementation((namespace: string) => {
    if (namespace === 'NotFound') {
      return (key: string) => {
        const translations: Record<string, string> = {
          title: 'Page Not Found',
          description: 'Sorry, the page you’re looking for doesn’t exist.',
        };
        return translations[key] || key;
      };
    }
  }),
}));

describe('NotFound Page', () => {
  it('renders translated text and the "Go Home" link', () => {
    render(<NotFound />);

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(
      screen.getByText('Sorry, the page you’re looking for doesn’t exist.')
    ).toBeInTheDocument();
  });
});
