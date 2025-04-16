import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignIn from './page';

vi.mock('@/app/components/authentification/Auth', () => {
  return {
    default: ({ registration }: { registration: boolean }) => (
      <div>Mocked Auth - registration: {String(registration)}</div>
    ),
  };
});

describe('SignIn Page', () => {
  it('renders Auth with registration=false', () => {
    render(<SignIn />);
    expect(
      screen.getByText('Mocked Auth - registration: false')
    ).toBeInTheDocument();
  });
});
