import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResizableLayout } from './useResizableLayout';

describe('useResizableLayout Hook', () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should return initial state correctly when initialOpen is false', () => {
    const { result } = renderHook(() => useResizableLayout(false));

    expect(result.current.isPanelOpen).toBe(false);
    expect(result.current.OPEN_LAYOUT).toEqual([70, 30]);
    expect(result.current.CLOSED_LAYOUT).toEqual([100, 0]);
  });

  it('should return initial state correctly when initialOpen is true', () => {
    const { result } = renderHook(() => useResizableLayout(true));

    expect(result.current.isPanelOpen).toBe(true);
    expect(result.current.OPEN_LAYOUT).toEqual([70, 30]);
    expect(result.current.CLOSED_LAYOUT).toEqual([100, 0]);
  });

  it('should update isPanelOpen state when syncPanelState is called with a different value', () => {
    const { result } = renderHook(() => useResizableLayout(false));

    expect(result.current.isPanelOpen).toBe(false);
    act(() => {
      result.current.syncPanelState(true);
    });

    expect(result.current.isPanelOpen).toBe(true);
    act(() => {
      result.current.syncPanelState(false);
    });
    expect(result.current.isPanelOpen).toBe(false);
  });

  it('should NOT update isPanelOpen state when syncPanelState is called with the same value', () => {
    const { result } = renderHook(() => useResizableLayout(false));

    expect(result.current.isPanelOpen).toBe(false);
    act(() => {
      result.current.syncPanelState(false);
    });
    expect(result.current.isPanelOpen).toBe(false);
    act(() => {
      result.current.syncPanelState(true);
    });
    expect(result.current.isPanelOpen).toBe(true);
    act(() => {
      result.current.syncPanelState(true);
    });
    expect(result.current.isPanelOpen).toBe(true);
  });

  it('togglePanel should be a function', () => {
    const { result } = renderHook(() => useResizableLayout(false));
    expect(result.current.togglePanel).toBeInstanceOf(Function);
  });
});
