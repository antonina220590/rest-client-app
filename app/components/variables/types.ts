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
