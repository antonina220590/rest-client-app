'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
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

export const VariablesListContent = () => {
  const variables = useAppSelector((state) => state.variables);
  const dispatch = useAppDispatch();
  const t = useTranslations('VariablesList');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'key' | 'value' | null>(
    null
  );

  const handleAdd = (key: string, value: string) => {
    dispatch(addVariable({ key, value }));
    toast.success(t('success.added', { key }));
  };

  const handleEditSave = (updatedVariable: Variable) => {
    if (!editingField) return;

    const originalVariable = variables.find((v) => v.id === updatedVariable.id);

    const hasChanged =
      originalVariable?.[editingField] !== updatedVariable[editingField];

    if (!hasChanged) {
      setEditingId(null);
      setEditingField(null);
      return;
    }

    if (editingField === 'key') {
      const keyExists = variables.some(
        (v) => v.id !== updatedVariable.id && v.key === updatedVariable.key
      );

      if (keyExists) {
        toast.error(t('error.keyExists', { key: updatedVariable.key }));
        return;
      }
    }

    dispatch(updateVariable(updatedVariable));
    toast.success(t('success.updated', { key: updatedVariable.key }));
    setEditingId(null);
    setEditingField(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
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

  const existingKeys = variables.map((variable) => variable.key);

  return (
    <div className="p-4 md:p-0 w-full max-w-3xl mx-auto">
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
              onCopy={copyToClipboard}
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

export default VariablesListContent;
