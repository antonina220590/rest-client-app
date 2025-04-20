import { render, screen } from '@testing-library/react';
import InputField from './InputField';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('InputField component', () => {
  const mockRegister = {
    name: 'email',
    onBlur: vi.fn(),
    onChange: vi.fn(),
    ref: vi.fn(),
  };

  it('renders input with correct placeholder and type', () => {
    render(
      <InputField
        type="email"
        placeholder="Enter your email"
        register={mockRegister}
      />
    );
    const input = screen.getByPlaceholderText('Enter your email');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });
});
