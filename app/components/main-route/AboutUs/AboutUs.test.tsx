import { render, screen } from '@testing-library/react';
import AboutUs from './AboutUs';

describe('AboutUs component', () => {
  it('should comtain an h2 tag', () => {
    render(<AboutUs />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
