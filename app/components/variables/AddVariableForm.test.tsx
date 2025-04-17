import { render, screen, fireEvent } from '@testing-library/react';
import { AddVariableForm } from './AddVariableForm';
import { vi } from 'vitest';
import React from 'react';
import { IntlProvider } from 'next-intl';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const messages = {
  VariablesEditor: {
    keyPlaceholder: 'Key',
    valuePlaceholder: 'Value',
    restClient: 'Rest Client',
    addButton: 'Add',
    error: {
      emptyFields: 'Fields cannot be empty',
      keyExists: 'Key "{key}" already exists',
    },
  },
};

const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>
  );

describe('AddVariableForm', () => {
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inputs and button', () => {
    renderWithIntl(<AddVariableForm onAdd={mockOnAdd} existingKeys={[]} />);

    expect(screen.getByPlaceholderText('Key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('disables button when fields are empty', () => {
    renderWithIntl(<AddVariableForm onAdd={mockOnAdd} existingKeys={[]} />);
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toBeDisabled();
  });

  it('shows error if key already exists', () => {
    renderWithIntl(
      <AddVariableForm onAdd={mockOnAdd} existingKeys={['existing']} />
    );
    fireEvent.change(screen.getByPlaceholderText('Key'), {
      target: { value: 'existing' },
    });
    fireEvent.change(screen.getByPlaceholderText('Value'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(toast.error).toHaveBeenCalledWith('Key "existing" already exists');
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with trimmed key/value and resets inputs', () => {
    renderWithIntl(<AddVariableForm onAdd={mockOnAdd} existingKeys={[]} />);
    fireEvent.change(screen.getByPlaceholderText('Key'), {
      target: { value: '  myKey  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Value'), {
      target: { value: '  myValue  ' },
    });

    const button = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(button);

    expect(mockOnAdd).toHaveBeenCalledWith('myKey', 'myValue');
    expect(screen.getByPlaceholderText('Key')).toHaveValue('');
    expect(screen.getByPlaceholderText('Value')).toHaveValue('');
  });
});
