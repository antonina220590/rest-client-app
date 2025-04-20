import { render, screen, waitFor } from '@testing-library/react';
import History from '@/app/[locale]/history/page';
import { IntlProvider } from 'next-intl';
import { vi } from 'vitest';
import React from 'react';
import {
  useHistoryItems,
  useClearHistory,
  useDeleteHistoryItem,
} from '@/app/hooks/historyHooks';

vi.mock('@/app/hooks/historyHooks', () => ({
  useHistoryItems: vi.fn(),
  useClearHistory: vi.fn(),
  useDeleteHistoryItem: vi.fn(),
}));

const messages = {
  HistoryList: {
    title: 'Request History',
    clearButton: 'Clear History',
    emptyTitle: "You haven't executed any requests yet",
    emptyDescription: "It's empty here. Try those options:",
    goToClientButton: 'Go to REST Client',
    methodLabel: 'Method',
    urlLabel: 'URL',
    timeLabel: 'Time',
    bodyTypeLabel: 'Body Type',
    copyLinkTooltip: 'Copy request link',
    error: {
      clearFailed: 'Failed to clear history',
      deleteFailed: 'Failed to delete item',
    },
    success: {
      cleared: 'History cleared successfully',
      deleted: 'Item deleted',
    },
  },
};

const renderWithIntl = (ui: React.ReactElement) =>
  render(
    <IntlProvider locale="en" messages={messages}>
      {ui}
    </IntlProvider>
  );

describe('History Page (with lazy-loaded HistoryList)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHistoryItems).mockReturnValue([]);
    vi.mocked(useClearHistory).mockReturnValue(vi.fn());
    vi.mocked(useDeleteHistoryItem).mockReturnValue(vi.fn());
  });

  it('should render empty title when history is empty', async () => {
    renderWithIntl(<History />);
    const heading = await screen.findByRole('heading', {
      name: /you haven't executed any requests yet/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('should render the empty description paragraph', async () => {
    renderWithIntl(<History />);
    const paragraph = await screen.findByText(
      /it's empty here. try those options:/i
    );
    expect(paragraph).toBeInTheDocument();
  });

  it('should render the go to client button', async () => {
    renderWithIntl(<History />);
    const button = await screen.findByRole('button', {
      name: /go to rest client/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should render centered container for empty state', async () => {
    const { container } = renderWithIntl(<History />);
    await waitFor(() => {
      expect(
        screen.getByText(/you haven't executed any requests yet/i)
      ).toBeInTheDocument();
    });
    const div = container.querySelector('.text-center');
    expect(div).toBeInTheDocument();
  });
});
