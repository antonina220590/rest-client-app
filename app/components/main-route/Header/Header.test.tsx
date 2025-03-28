import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('should comtain an h1 tag', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
