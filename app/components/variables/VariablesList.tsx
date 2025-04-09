'use client';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addVariable,
  deleteVariable,
  updateVariable,
} from '../../store/variablesSlice';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { VariableItem } from './VariableItem';
import { AddVariableForm } from './AddVariableForm';
import { Variable } from '@/app/store/types';

const VariablesListContent = () => {
  const t = useTranslations('VariablesList');
  const variables = useAppSelector((state) => state.variables);
  const dispatch = useAppDispatch();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'key' | 'value' | null>(
    null
  );

  const handleAdd = (key: string, value: string) => {
    dispatch(addVariable({ key, value }));
  };

  const handleEditStart = (variable: Variable, field: 'key' | 'value') => {
    setEditingId(variable.id);
    setEditingField(field);
  };

  const handleEditSave = (variable: Variable) => {
    if (editingField) {
      dispatch(updateVariable(variable));
      setEditingId(null);
      setEditingField(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-6 w-[100%] max-w-3xl mx-auto ">
      <div className="flex flex-col space-y-4 md:space-y-6">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-bg-secondary">
          {t('title')}
        </h1>

        <AddVariableForm onAdd={handleAdd} />

        <div className="space-y-2 md:space-y-3">
          {variables.map((variable) => (
            <VariableItem
              key={variable.id}
              variable={variable}
              onEdit={handleEditStart}
              onSave={handleEditSave}
              onDelete={(id) => dispatch(deleteVariable(id))}
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

export default dynamic(() => Promise.resolve(VariablesListContent), {
  loading: () => (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
      Loading variables...
    </div>
  ),
  ssr: false,
});
