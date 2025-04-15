import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResizableContainer from './ResizableContainer';
import type { RootState } from '@/app/store/store';
import type { RenderOptions } from '@testing-library/react';
import type { EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import restClientReducer, {
  initialState as restClientInitialState,
} from '@/app/store/restClientSlice';
import variablesReducer, {
  initialState as variablesInitialState,
} from '@/app/store/variablesSlice';
import { JSX } from 'react';

const { mockUseResizableLayoutFn } = vi.hoisted(() => ({
  mockUseResizableLayoutFn: vi.fn(),
}));
const { mockUseSyncUrlFn } = vi.hoisted(() => ({ mockUseSyncUrlFn: vi.fn() }));
const { mockUseNotificationsFn } = vi.hoisted(() => ({
  mockUseNotificationsFn: vi.fn(),
}));

vi.mock('@/app/hooks/useResizableLayout', () => ({
  useResizableLayout: mockUseResizableLayoutFn,
}));
vi.mock('@/app/hooks/useSyncUrlWithReduxState', () => ({
  useSyncUrlWithReduxState: mockUseSyncUrlFn,
}));
vi.mock('@/app/hooks/useRequestNotifications', () => ({
  useRequestNotifications: mockUseNotificationsFn,
}));

vi.mock('../MethodSelector/MethodSelector', () => ({
  default: vi.fn(() => (
    <div data-testid="method-selector">Mock MethodSelector</div>
  )),
}));
vi.mock('../UrlInput/UrlInput', () => ({
  default: vi.fn((props) => {
    return <input data-testid="url-input" defaultValue={props.value} />;
  }),
}));
vi.mock('../RequestResponseArea/RequestResponseArea', () => ({
  RequestResponseArea: vi.fn(() => (
    <div data-testid="request-response-area">Mock RequestResponseArea</div>
  )),
}));
vi.mock('../codeGenerator/CodeContainer', () => ({
  default: vi.fn(() => (
    <div data-testid="code-container">Mock CodeContainer</div>
  )),
}));
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
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

describe('ResizableContainer Component', () => {
  let mockTogglePanel: Mock;

  beforeEach(() => {
    vi.resetAllMocks();

    mockTogglePanel = vi.fn();
    mockUseResizableLayoutFn.mockReturnValue({
      isPanelOpen: false,
      layoutGroupRef: { current: null },
      togglePanel: mockTogglePanel,
      syncPanelState: vi.fn(),
      OPEN_LAYOUT: [70, 30],
      CLOSED_LAYOUT: [100, 0],
    });
  });
  it('should render main components and call hooks', () => {
    renderWithProviders(<ResizableContainer initialMethod="GET" />);
    expect(screen.getByTestId('method-selector')).toBeInTheDocument();
    expect(mockUseResizableLayoutFn).toHaveBeenCalledTimes(2);
    expect(mockUseSyncUrlFn).toHaveBeenCalledTimes(2);
    expect(mockUseNotificationsFn).toHaveBeenCalledTimes(2);
  });
});
