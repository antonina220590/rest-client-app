import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VariablesListContent } from './VariablesList';
import { IntlProvider } from 'next-intl';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import type { RootState } from '@/app/interfaces';
import { VariableItem } from './VariableItem';

const messages = {
  VariablesList: {
    title: 'Variables',
    keyLabel: 'Key',
    valueLabel: 'Value',
    keyPlaceholder: 'Enter key',
    valuePlaceholder: 'Enter value',
    addButton: 'Add Variable',
    copyTooltip: 'Click to copy',
    copiedText: 'Copied!',
    deleteAriaLabel: 'Delete variable',
    error: {
      keyExists: 'Variable with key {key} already exists',
    },
    success: {
      added: 'Variable {key} added',
      updated: 'Variable {key} updated',
      deleted: 'Variable {key} deleted',
    },
  },
};

const mockVariables = [
  { id: '1', key: 'token', value: '1234567890abcdef' },
  { id: '2', key: 'apiKey', value: 'abcdef1234567890' },
];

vi.mock('../../store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>
  );

describe('VariablesListContent', () => {
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
    vi.spyOn(Storage.prototype, 'setItem');

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    vi.mocked(useAppSelector).mockImplementation((selector) => {
      const mockState: RootState = {
        variables: mockVariables,
        restClient: {
          method: 'GET',
          url: '',
          requestBody: '',
          bodyLanguage: 'json',
          headers: [],
          queryParams: [],
          isLoading: false,
          error: null,
          responseData: null,
          responseStatus: null,
          responseContentType: null,
        },
        history: {
          items: [],
        },
      };
      return selector(mockState);
    });
  });

  it('renders list of variables', () => {
    renderWithIntl(<VariablesListContent />);
    expect(screen.getByText('token')).toBeInTheDocument();
    expect(screen.getByText('1234567890abcdef')).toBeInTheDocument();
    expect(screen.getByText('apiKey')).toBeInTheDocument();
    expect(screen.getByText('abcdef1234567890')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /delete variable/i })
    ).toHaveLength(2);
  });

  it('shows add variable button', () => {
    renderWithIntl(<VariablesListContent />);
    expect(
      screen.getByRole('button', { name: /add variable/i })
    ).toBeInTheDocument();
  });

  it('calls dispatch when adding new variable', async () => {
    renderWithIntl(<VariablesListContent />);
    const keyInput = screen.getByPlaceholderText(/enter key/i);
    const valueInput = screen.getByPlaceholderText(/enter value/i);
    const addButton = screen.getByRole('button', { name: /add variable/i });

    fireEvent.change(keyInput, { target: { value: 'env' } });
    fireEvent.change(valueInput, { target: { value: 'production' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'variables/addVariable',
          payload: expect.objectContaining({
            key: 'env',
            value: 'production',
          }),
        })
      );
    });
  });

  it('copies variable key as {{key}} and shows "Copied!" message', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    renderWithIntl(<VariablesListContent />);

    const copyEls = screen.getAllByTitle('Click to copy');
    fireEvent.click(copyEls[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('{{token}}');

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('calls delete when delete button clicked', async () => {
    renderWithIntl(<VariablesListContent />);
    const deleteButtons = screen.getAllByRole('button', {
      name: /delete variable/i,
    });
    fireEvent.click(deleteButtons[0]);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'variables/deleteVariable',
      payload: '1',
    });
  });
  describe('VariableItem', () => {
    it('lets user edit value on click and calls onSave on blur', () => {
      const mockOnEdit = vi.fn();
      const mockOnSave = vi.fn();

      render(
        <IntlProvider locale="ru" messages={messages}>
          <VariableItem
            variable={{
              id: '1',
              key: 'apiKey',
              value: '1234567890abcdef',
            }}
            onEdit={mockOnEdit}
            onSave={mockOnSave}
            onDelete={vi.fn()}
            onCopy={vi.fn()}
            copiedId=""
            editingId="1"
            editingField="value"
          />
        </IntlProvider>
      );

      const input = screen.getByDisplayValue('1234567890abcdef');
      fireEvent.change(input, { target: { value: 'new-value' } });
      fireEvent.blur(input);

      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        key: 'apiKey',
        value: 'new-value',
      });
    });

    it('triggers onEdit when value cell is clicked', () => {
      const mockOnEdit = vi.fn();

      render(
        <IntlProvider locale="ru" messages={messages}>
          <VariableItem
            variable={{
              id: '1',
              key: 'apiKey',
              value: '1234567890abcdef',
            }}
            onEdit={mockOnEdit}
            onSave={vi.fn()}
            onDelete={vi.fn()}
            onCopy={vi.fn()}
            copiedId=""
            editingId=""
            editingField={null}
          />
        </IntlProvider>
      );

      const valueCell = screen.getByText('1234567890abcdef');
      fireEvent.click(valueCell);

      expect(mockOnEdit).toHaveBeenCalledWith(
        {
          id: '1',
          key: 'apiKey',
          value: '1234567890abcdef',
        },
        'value'
      );
    });
  });
  it('saves updated variables to localStorage', async () => {
    renderWithIntl(<VariablesListContent />);
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'variables',
        JSON.stringify(mockVariables)
      );
    });
  });
});
