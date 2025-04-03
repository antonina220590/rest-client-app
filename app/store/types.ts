export interface Variable {
  id: string;
  key: string;
  value: string;
  createdAt: number;
  updatedAt?: number;
}

export interface RootState {
  variables: Variable[];
}

export interface PreloadedState {
  variables: Variable[];
}
