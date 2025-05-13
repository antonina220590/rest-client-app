import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('render Footer component', () => {
    render(<Footer />);
    expect(screen.getByText('© 2025')).toBeInTheDocument();
  });
});
