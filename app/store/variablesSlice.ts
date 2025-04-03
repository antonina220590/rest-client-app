import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Variable } from './types';

const initialState: Variable[] = [];

export const variablesSlice = createSlice({
  name: 'variables',
  initialState,
  reducers: {
    addVariable: {
      reducer(state, action: PayloadAction<Variable>) {
        state.push(action.payload);
      },
      prepare(payload: Omit<Variable, 'id' | 'createdAt'>) {
        return {
          payload: {
            ...payload,
            id: Date.now().toString(),
            createdAt: Date.now(),
          },
        };
      },
    },
    deleteVariable(state, action: PayloadAction<string>) {
      return state.filter((v) => v.id !== action.payload);
    },
    updateVariable(state, action: PayloadAction<Variable>) {
      const index = state.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state[index] = {
          ...action.payload,
          updatedAt: Date.now(),
        };
      }
    },
    setVariables(_state, action: PayloadAction<Variable[]>) {
      return action.payload;
    },
  },
});

export const { addVariable, deleteVariable, updateVariable, setVariables } =
  variablesSlice.actions;
export default variablesSlice.reducer;
