import { configureStore } from '@reduxjs/toolkit';
import variablesReducer from './variablesSlice';
import { PreloadedState } from './types';

const loadState = () => {
  if (typeof window === 'undefined') return undefined;

  try {
    const serializedState = localStorage.getItem('variablesState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    variables: variablesReducer,
  },
  preloadedState: loadState() as PreloadedState | undefined,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState();
    try {
      localStorage.setItem('variablesState', JSON.stringify(state));
    } catch {}
  });
}

export * from './variablesSlice';
