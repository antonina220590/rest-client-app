import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useDebounce } from '@/app/hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const initialValue = 'initial';
    const delay = 500;

    const { result } = renderHook(() => useDebounce(initialValue, delay));

    expect(result.current).toBe(initialValue);

    vi.advanceTimersByTime(delay - 1);
    expect(result.current).toBe(initialValue);
  });

  it('should not update the debounced value before the delay has passed', () => {
    const initialValue = 'value 1';
    const newValue = 'value 2';
    const delay = 500;

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialValue, delay } }
    );

    expect(result.current).toBe(initialValue);

    act(() => {
      rerender({ value: newValue, delay });
    });

    expect(result.current).toBe(initialValue);
    act(() => {
      vi.advanceTimersByTime(delay - 1);
    });
    expect(result.current).toBe(initialValue);
  });

  it('should update the debounced value after the delay has passed', () => {
    const initialValue = 'first value';
    const updatedValue = 'second value';
    const delay = 500;

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialValue, delay } }
    );

    act(() => {
      rerender({ value: updatedValue, delay });
    });

    expect(result.current).toBe(initialValue);

    act(() => {
      vi.advanceTimersByTime(delay);
    });
    expect(result.current).toBe(updatedValue);
    act(() => {
      vi.advanceTimersByTime(delay * 3);
    });
    expect(result.current).toBe(updatedValue);
  });
});
