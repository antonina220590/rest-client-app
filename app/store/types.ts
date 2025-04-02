export interface Variable {
  id: string;
  key: string;
  value: string;
  createdAt?: number;
  updatedAt?: number;
}

export type VariableFormData = Omit<Variable, 'id' | 'createdAt' | 'updatedAt'>;
