import { render, screen } from '@testing-library/react';
import History from './page';

describe('History Component', () => {
  it('should render title correctly', () => {
    render(<History />);
    const headingElement = screen.getByRole('heading', {
      name: /history page/i,
    });
    expect(headingElement).toBeInTheDocument();
  });

  it('should render div-container', () => {
    const { container } = render(<History />);
    const divElement = container.firstChild;
    expect(divElement).toBeInTheDocument();
    expect(divElement).toHaveClass('text-center');
  });
});
