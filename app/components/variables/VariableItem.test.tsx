import { render, screen, fireEvent } from '@testing-library/react';
import { VariableItem } from './VariableItem';
import { IntlProvider } from 'next-intl';
import { expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import * as textUtils from './helpers/textUtils';

const messages = {
  VariablesEditor: {
    keyLabel: 'Key',
    valueLabel: 'Value',
    keyPlaceholder: 'Enter key',
    valuePlaceholder: 'Enter value',
    copyTooltip: 'Click to copy',
    copiedText: 'Copied!',
    deleteAriaLabel: 'Delete variable',
  },
};

const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>
  );

const mockVariable = {
  id: '1',
  key: 'token',
  value: '1234567890abcdef',
};

describe('VariableItem', () => {
  beforeEach(() => {
    vi.spyOn(textUtils, 'copyToClipboardText').mockImplementation(() => {});
    vi.spyOn(textUtils, 'truncateText').mockImplementation((text) => text);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders key and value correctly', () => {
    renderWithIntl(
      <VariableItem
        variable={mockVariable}
        onEdit={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        copiedId=""
        editingId=""
        editingField={null}
      />
    );

    expect(screen.getByText('{{token}}')).toBeInTheDocument();
    expect(screen.getByText('1234567890abcdef')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();

    renderWithIntl(
      <VariableItem
        variable={mockVariable}
        onEdit={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
        onCopy={vi.fn()}
        copiedId=""
        editingId=""
        editingField={null}
      />
    );

    const deleteButton = screen.getByRole('button', {
      name: /delete variable/i,
    });

    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('calls onCopy and copyToClipboardText when variable tag is clicked', () => {
    const onCopy = vi.fn();

    renderWithIntl(
      <VariableItem
        variable={mockVariable}
        onEdit={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onCopy={onCopy}
        copiedId=""
        editingId=""
        editingField={null}
      />
    );

    const tag = screen.getByText('{{token}}');
    fireEvent.click(tag);

    expect(onCopy).toHaveBeenCalledWith('token', '1');
    expect(textUtils.copyToClipboardText).toHaveBeenCalledWith('token', {
      wrapInBraces: true,
    });
  });

  it('renders input for editing key and calls onSave on Enter', () => {
    const onSave = vi.fn();

    renderWithIntl(
      <VariableItem
        variable={mockVariable}
        onEdit={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        copiedId=""
        editingId="1"
        editingField="key"
      />
    );

    const input = screen.getByDisplayValue('token');
    fireEvent.change(input, { target: { value: 'apiKey' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onSave).toHaveBeenCalledWith({
      ...mockVariable,
      key: 'apiKey',
    });
  });

  it('renders input for editing value and calls onSave on blur', () => {
    const onSave = vi.fn();

    renderWithIntl(
      <VariableItem
        variable={mockVariable}
        onEdit={vi.fn()}
        onSave={onSave}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        copiedId=""
        editingId="1"
        editingField="value"
      />
    );

    const input = screen.getByDisplayValue('1234567890abcdef');
    fireEvent.change(input, { target: { value: 'newvalue123' } });
    fireEvent.blur(input);

    expect(onSave).toHaveBeenCalledWith({
      ...mockVariable,
      value: 'newvalue123',
    });
  });

  it('shows copied text when copiedId matches the variable id', () => {
    renderWithIntl(
      <VariableItem
        variable={mockVariable}
        onEdit={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onCopy={vi.fn()}
        copiedId="1"
        editingId=""
        editingField={null}
      />
    );

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
