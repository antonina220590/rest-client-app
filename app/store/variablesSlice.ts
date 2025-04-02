import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Variable } from './types';

const loadVariables = (): Variable[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('variables');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
};

const initialState: Variable[] = loadVariables();

export const variablesSlice = createSlice({
  name: 'variables',
  initialState,
  reducers: {
    addVariable: (state, action: PayloadAction<Omit<Variable, 'id'>>) => {
      const newVar: Variable = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      state.push(newVar);
      localStorage.setItem('variables', JSON.stringify(state));
    },

    deleteVariable: (state, action: PayloadAction<string>) => {
      const newState = state.filter((v) => v.id !== action.payload);
      localStorage.setItem('variables', JSON.stringify(newState));
      return newState;
    },

    updateVariable: (state, action: PayloadAction<Variable>) => {
      const index = state.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
        localStorage.setItem('variables', JSON.stringify(state));
      }
    },
  },
});

export const { addVariable, deleteVariable, updateVariable } =
  variablesSlice.actions;

export const selectVariables = (state: { variables: Variable[] }) =>
  state.variables;

export default variablesSlice.reducer;
