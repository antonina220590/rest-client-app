import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ProblemChild = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('should display error message when an error occurs', () => {
    vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
