import { render, screen } from '@testing-library/react';
import AboutRSS from './AboutRSS';

describe('AboutRSS component', () => {
  it('should comtain an h2 tag', () => {
    render(<AboutRSS />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
