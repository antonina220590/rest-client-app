'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  addVariable,
  deleteVariable,
  updateVariable,
} from '@/app/store/variablesSlice';
import { VariableItem } from './VariableItem';
import { AddVariableForm } from './AddVariableForm';
import { Variable } from '@/app/interfaces';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { copyToClipboardText } from './helpers/textUtils';

export const VariablesEditor = () => {
  const variables = useAppSelector((state) => state.variables);
  const dispatch = useAppDispatch();
  const t = useTranslations('VariablesEditor');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'key' | 'value' | null>(
    null
  );

  const existingKeys = variables.map((v) => v.key);

  useEffect(() => {
    localStorage.setItem('variables', JSON.stringify(variables));
  }, [variables]);

  const handleAdd = (key: string, value: string) => {
    dispatch(addVariable({ key, value }));
    toast.success(t('success.added', { key }));
  };

  const handleEditSave = (updatedVariable: Variable) => {
    if (!editingField) return;

    const original = variables.find((v) => v.id === updatedVariable.id);
    const hasChanged =
      original?.[editingField] !== updatedVariable[editingField];

    if (!hasChanged) {
      resetEditing();
      return;
    }

    if (
      editingField === 'key' &&
      variables.some(
        (v) => v.id !== updatedVariable.id && v.key === updatedVariable.key
      )
    ) {
      toast.error(t('error.keyExists', { key: updatedVariable.key }));
      return;
    }

    dispatch(updateVariable(updatedVariable));
    toast.success(t('success.updated', { key: updatedVariable.key }));
    resetEditing();
  };

  const resetEditing = () => {
    setEditingId(null);
    setEditingField(null);
  };

  const handleCopy = (text: string, id: string) => {
    copyToClipboardText(text, { wrapInBraces: true });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(t('copiedText'));
  };

  const handleDelete = (id: string) => {
    const variable = variables.find((v) => v.id === id);
    if (variable) {
      dispatch(deleteVariable(id));
      toast.success(t('success.deleted', { key: variable.key }));
    }
  };

  return (
    <div
      className="my-8 p-4 md:p-0 w-full max-w-3xl mx-auto"
      data-testid="variables-list"
    >
      <div className="flex flex-col space-y-4 md:space-y-6">
        <AddVariableForm onAdd={handleAdd} existingKeys={existingKeys} />
        <div className="space-y-2 md:space-y-3">
          {variables.map((variable) => (
            <VariableItem
              key={variable.id}
              variable={variable}
              onEdit={(v, field) => {
                setEditingId(v.id);
                setEditingField(field);
              }}
              onSave={handleEditSave}
              onDelete={handleDelete}
              onCopy={handleCopy}
              copiedId={copiedId}
              editingId={editingId}
              editingField={editingField}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VariablesEditor;
