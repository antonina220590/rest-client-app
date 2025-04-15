import { render, screen } from '@testing-library/react';
import History from './page';
import { IntlProvider } from 'next-intl';

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

describe('History Component', () => {
  it('should render empty title when history is empty', () => {
    renderWithIntl(<History />);
    const heading = screen.getByRole('heading', {
      name: /you haven't executed any requests yet/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('should render the empty description paragraph', () => {
    renderWithIntl(<History />);
    const paragraph = screen.getByText(/it's empty here. try those options:/i);
    expect(paragraph).toBeInTheDocument();
  });

  it('should render the go to client button', () => {
    renderWithIntl(<History />);
    const button = screen.getByRole('button', {
      name: /go to rest client/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should render centered container', () => {
    const { container } = renderWithIntl(<History />);
    const div = container.querySelector('.text-center');
    expect(div).toBeInTheDocument();
  });
});
