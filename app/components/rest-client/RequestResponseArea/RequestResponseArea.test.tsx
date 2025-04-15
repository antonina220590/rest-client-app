import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

import { RequestResponseArea } from './RequestResponseArea';

import type { UseCollapsiblePanelReturn } from '@/app/hooks/useCollapsiblePanel';
import type { FormattedResponse } from '@/app/hooks/useFormattedResponse';
import restClientReducer, {
  initialState as restClientInitialState,
} from '@/app/store/restClientSlice';
import variablesReducer, {
  initialState as variablesInitialState,
} from '../../../store/variablesSlice';
import type { RootState } from '@/app/store/store';
import { JSX } from 'react';

const { mockUseCollapsiblePanelFn } = vi.hoisted(() => {
  return { mockUseCollapsiblePanelFn: vi.fn() };
});

const { mockUseFormattedResponseFn } = vi.hoisted(() => {
  return { mockUseFormattedResponseFn: vi.fn() };
});

vi.mock('../TabsComponent/TabsComponent', () => {
  return {
    default: vi.fn((props) => {
      return (
        <div
          data-testid="tabs-component"
          data-active-tab={props.value}
          data-method={props.method}
        >
          Mock Tabs (Active: {props.value})
        </div>
      );
    }),
  };
});
vi.mock('../BodyEditor/BodyEditor', () => ({
  default: vi.fn(({ value, language }) => (
    <div data-testid="response-editor" data-language={language}>
      {value}
    </div>
  )),
}));
vi.mock('../../Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

interface RenderWithProvidersOptions {
  preloadedState?: Partial<RootState>;
  store?: EnhancedStore<RootState>;
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: EnhancedStore<RootState>;
}

const defaultInitialRootState: RootState = {
  variables: variablesInitialState,
  restClient: restClientInitialState,
};

function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        variables: variablesReducer,
        restClient: restClientReducer,
      },
      preloadedState: { ...defaultInitialRootState, ...preloadedState },
    }),
    ...renderOptions
  }: RenderWithProvidersOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

vi.mock('@/app/hooks/useCollapsiblePanel', () => ({
  default: mockUseCollapsiblePanelFn,
}));

vi.mock('@/app/hooks/useFormattedResponse', () => ({
  default: mockUseFormattedResponseFn,
}));

describe('RequestResponseArea Component', () => {
  let mockTogglePanel: Mock;
  let mockOpenPanel: Mock;
  let mockSyncPanelState: Mock;
  let mockCollapsiblePanelReturnValue: UseCollapsiblePanelReturn;
  let mockFormattedResponseReturnValue: FormattedResponse;

  beforeEach(() => {
    vi.resetAllMocks();
    mockTogglePanel = vi.fn();
    mockOpenPanel = vi.fn();
    mockSyncPanelState = vi.fn();

    mockCollapsiblePanelReturnValue = {
      isCollapsed: false,
      panelGroupRef: { current: null },
      togglePanel: mockTogglePanel,
      openPanel: mockOpenPanel,
      syncPanelState: mockSyncPanelState,
      OPEN_LAYOUT: [40, 60],
      COLLAPSED_LAYOUT: [2, 98],
      COLLAPSED_SIZE: 2,
    };

    mockUseCollapsiblePanelFn.mockReturnValue(mockCollapsiblePanelReturnValue);

    mockFormattedResponseReturnValue = {
      displayValue: 'Default Response',
      displayLanguage: 'plaintext',
    };
    mockUseFormattedResponseFn.mockReturnValue(
      mockFormattedResponseReturnValue
    );
  });

  it('should render tabs and default response after mounting', async () => {
    mockUseFormattedResponseFn.mockReturnValue({
      displayValue: 'Initial Default',
      displayLanguage: 'plaintext',
    });

    renderWithProviders(<RequestResponseArea />);

    const tabsComponent = await screen.findByTestId('tabs-component');
    expect(tabsComponent).toBeInTheDocument();

    expect(screen.queryByText('Loading tabs...')).not.toBeInTheDocument();
    expect(screen.getByTestId('response-editor')).toHaveTextContent(
      'Initial Default'
    );
    expect(screen.getByTestId('response-editor')).toHaveAttribute(
      'data-language',
      'plaintext'
    );

    expect(screen.queryByText(/Status:/)).not.toBeInTheDocument();
  });

  it('should render spinner when isLoading is true', async () => {
    const preloadedState: Partial<RootState> = {
      restClient: { ...restClientInitialState, isLoading: true },
    };
    renderWithProviders(<RequestResponseArea />, { preloadedState });

    await screen.findByTestId('tabs-component');

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByTestId('response-editor')).not.toBeInTheDocument();
  });

  it('should render status when available', async () => {
    const preloadedState: Partial<RootState> = {
      restClient: {
        ...restClientInitialState,
        isLoading: false,
        responseStatus: 200,
      },
    };
    renderWithProviders(<RequestResponseArea />, { preloadedState });

    await screen.findByTestId('tabs-component');

    const statusSpan = await screen.findByText(/Status:/);
    expect(statusSpan).toBeInTheDocument();
    expect(statusSpan.textContent).toContain('200');
  });

  it('should call togglePanel when collapse/expand button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RequestResponseArea />);
    await screen.findByTestId('tabs-component');

    const toggleButton = screen.getByRole('button', {
      name: /toggle request panel/i,
    });
    await user.click(toggleButton);

    expect(mockTogglePanel).toHaveBeenCalledTimes(1);
  });
});
