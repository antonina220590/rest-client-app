export interface Variable {
  id: string;
  key: string;
  value: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface RootState {
  variables: Variable[];
}

export interface PreloadedState {
  variables: Variable[];
}

export type VariableItemProps = {
  variable: Variable;
  onEdit: (variable: Variable, field: 'key' | 'value') => void;
  onSave: (variable: Variable) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  editingId: string | null;
  editingField: 'key' | 'value' | null;
};
