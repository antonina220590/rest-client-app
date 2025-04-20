import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { type ImperativePanelGroupHandle } from 'react-resizable-panels';

import useCollapsiblePanel from '@/app/hooks/useCollapsiblePanel';

describe('useCollapsiblePanel Hook', () => {
  let mockSetLayout: Mock;
  let mockPanelGroupHandle: ImperativePanelGroupHandle;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetLayout = vi.fn();
    mockPanelGroupHandle = {
      setLayout: mockSetLayout,
      getId: vi.fn(() => 'mockId'),
      getLayout: vi.fn(() => [50, 50]),
    };
  });

  it('should initialize with default collapsed state (false) and correct layout constants', () => {
    const { result } = renderHook(() => useCollapsiblePanel());
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.panelGroupRef.current).toBeNull();
    expect(typeof result.current.togglePanel).toBe('function');
    expect(typeof result.current.openPanel).toBe('function');
    expect(typeof result.current.syncPanelState).toBe('function');
    expect(result.current.OPEN_LAYOUT).toEqual([40, 60]);
    expect(result.current.COLLAPSED_LAYOUT).toEqual([2, 98]);
    expect(result.current.COLLAPSED_SIZE).toBe(2);
  });

  it('should initialize with provided initial collapsed state (true)', () => {
    const { result } = renderHook(() => useCollapsiblePanel(true));
    expect(result.current.isCollapsed).toBe(true);
    expect(result.current.OPEN_LAYOUT).toEqual([40, 60]);
  });

  it('should set isCollapsed to false and call setLayout with OPEN_LAYOUT when openPanel is called', () => {
    const { result } = renderHook(() => useCollapsiblePanel(true));
    act(() => {
      (
        result.current
          .panelGroupRef as React.MutableRefObject<ImperativePanelGroupHandle | null>
      ).current = mockPanelGroupHandle;
    });
    expect(result.current.isCollapsed).toBe(true);
    act(() => {
      result.current.openPanel();
    });
    expect(result.current.isCollapsed).toBe(false);
    expect(mockSetLayout).toHaveBeenCalledTimes(1);
    expect(mockSetLayout).toHaveBeenCalledWith(result.current.OPEN_LAYOUT);
  });

  it('should set isCollapsed to false and call setLayout with OPEN_LAYOUT when togglePanel is called on a collapsed panel', () => {
    const { result } = renderHook(() => useCollapsiblePanel(true));
    act(() => {
      (
        result.current
          .panelGroupRef as React.MutableRefObject<ImperativePanelGroupHandle | null>
      ).current = mockPanelGroupHandle;
    });
    expect(result.current.isCollapsed).toBe(true);
    act(() => {
      result.current.togglePanel();
    });
    expect(result.current.isCollapsed).toBe(false);
    expect(mockSetLayout).toHaveBeenCalledTimes(1);
    expect(mockSetLayout).toHaveBeenCalledWith(result.current.OPEN_LAYOUT);
  });

  it('should set isCollapsed to true and call setLayout with COLLAPSED_LAYOUT when togglePanel is called on an open panel', () => {
    const { result } = renderHook(() => useCollapsiblePanel());
    act(() => {
      (
        result.current
          .panelGroupRef as React.MutableRefObject<ImperativePanelGroupHandle | null>
      ).current = mockPanelGroupHandle;
    });
    expect(result.current.isCollapsed).toBe(false);
    act(() => {
      result.current.togglePanel();
    });
    expect(result.current.isCollapsed).toBe(true);
    expect(mockSetLayout).toHaveBeenCalledTimes(1);
    expect(mockSetLayout).toHaveBeenCalledWith(result.current.COLLAPSED_LAYOUT);
  });

  describe('syncPanelState Function', () => {
    it('should update isCollapsed state when called with a different value', () => {
      const { result } = renderHook(() => useCollapsiblePanel(false));
      expect(result.current.isCollapsed).toBe(false);
      act(() => {
        result.current.syncPanelState(true);
      });
      expect(result.current.isCollapsed).toBe(true);
      act(() => {
        result.current.syncPanelState(false);
      });

      expect(result.current.isCollapsed).toBe(false);
    });

    it('should NOT update isCollapsed state when called with the same value', () => {
      const { result } = renderHook(() => useCollapsiblePanel(false));
      expect(result.current.isCollapsed).toBe(false);
      act(() => {
        result.current.syncPanelState(false);
      });
      expect(result.current.isCollapsed).toBe(false);
      const { result: resultCollapsed } = renderHook(() =>
        useCollapsiblePanel(true)
      );
      expect(resultCollapsed.current.isCollapsed).toBe(true);

      act(() => {
        resultCollapsed.current.syncPanelState(true);
      });
      expect(resultCollapsed.current.isCollapsed).toBe(true);
    });

    it('should NOT call setLayout when syncPanelState is called', () => {
      const { result } = renderHook(() => useCollapsiblePanel(false));
      act(() => {
        (
          result.current
            .panelGroupRef as React.MutableRefObject<ImperativePanelGroupHandle | null>
        ).current = mockPanelGroupHandle;
      });
      mockSetLayout.mockClear();
      act(() => {
        result.current.syncPanelState(true);
      });
      act(() => {
        result.current.syncPanelState(false);
      });
      act(() => {
        result.current.syncPanelState(false);
      });
      expect(mockSetLayout).not.toHaveBeenCalled();
    });
  });
});
