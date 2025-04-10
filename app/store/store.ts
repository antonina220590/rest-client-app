import { configureStore } from '@reduxjs/toolkit';
import variablesReducer from './variablesSlice';
import restClientReducer from './restClientSlice';

const STATE_KEY = 'appPersistentState_v1';

const loadState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const serializedState = localStorage.getItem(STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    const fullState = JSON.parse(serializedState);
    return {
      variables: fullState.variables,
    };
  } catch {
    return undefined;
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    variables: variablesReducer,
    restClient: restClientReducer,
  },
  preloadedState: preloadedState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const state = store.getState();
    try {
      const stateToPersist = {
        variables: state.variables,
      };
      localStorage.setItem(STATE_KEY, JSON.stringify(stateToPersist));
    } catch {}
  });
}

export * from './variablesSlice';
