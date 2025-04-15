import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/interfaces';
import type { HistoryItem, HistoryState } from '@/app/interfaces';

const loadHistoryFromLocalStorage = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const history = localStorage.getItem('requestHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const initialState: HistoryState = {
  items: loadHistoryFromLocalStorage(),
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addHistoryItem: (
      state,
      action: PayloadAction<Omit<HistoryItem, 'id' | 'timestamp'>>
    ) => {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.items.unshift(newItem);

      if (typeof window !== 'undefined') {
        localStorage.setItem('requestHistory', JSON.stringify(state.items));
      }
    },
    removeRepeatedHistoryItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('requestHistory', JSON.stringify(state.items));
      }
    },
    clearHistory: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('requestHistory');
      }
    },
    deleteHistoryItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  addHistoryItem,
  clearHistory,
  removeRepeatedHistoryItem,
  deleteHistoryItem,
} = historySlice.actions;

export const selectHistoryItems = (state: RootState) => state.history.items;

export const selectSortedHistoryItems = createSelector(
  [selectHistoryItems],
  (items) => [...items].sort((a, b) => b.timestamp - a.timestamp)
);

export default historySlice.reducer;
