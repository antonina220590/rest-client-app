import { render, screen, waitFor } from '@testing-library/react';
import VariablesList from '@/app/[locale]/variables/page';
import { IntlProvider } from 'next-intl';
import { vi } from 'vitest';
import React from 'react';

vi.mock('@/app/components/variables/VariablesEditor', () => ({
  __esModule: true,
  default: () => <div>Mocked VariablesEditor</div>,
}));

const messages = {
  VariablesList: {
    title: 'Variables',
    emptyTitle: 'No variables yet',
    emptyDescription: 'Add some variables to get started!',
    addButton: 'Add Variable',
  },
};

const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>
  );

describe('VariablesList Page (with lazy-loaded VariablesEditor)', () => {
  it('should render mocked VariablesEditor', async () => {
    renderWithIntl(<VariablesList />);
    await waitFor(() => {
      expect(screen.getByText('Mocked VariablesEditor')).toBeInTheDocument();
    });
  });
});
