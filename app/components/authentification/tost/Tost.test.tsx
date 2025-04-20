import { render, screen } from '@testing-library/react';
import Tost from './Tost';

describe('Tost component', () => {
  const errorMessage = 'This is an error';
  it('renders the error message', () => {
    render(<Tost error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
