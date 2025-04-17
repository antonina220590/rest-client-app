'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Link from 'next/link';

type AddVariableFormProps = {
  onAdd: (key: string, value: string) => void;
  existingKeys: string[];
};

export const AddVariableForm = ({
  onAdd,
  existingKeys,
}: AddVariableFormProps) => {
  const t = useTranslations('VariablesEditor');
  const [newVar, setNewVar] = useState({ key: '', value: '' });

  const handleAdd = () => {
    const { key, value } = newVar;
    const trimmedKey = key.trim();

    if (!trimmedKey || !value.trim()) {
      toast.error(t('error.emptyFields'));
      return;
    }

    if (existingKeys.includes(trimmedKey)) {
      toast.error(t('error.keyExists', { key: trimmedKey }));
      return;
    }

    onAdd(trimmedKey, value.trim());
    setNewVar({ key: '', value: '' });
  };

  return (
    <div className="bg-accent p-3 md:p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
        <div>
          <input
            value={newVar.key}
            onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
            className="bg-card w-full p-2 text-sm md:text-base border border-border rounded font-body focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('keyPlaceholder')}
          />
        </div>
        <div>
          <input
            value={newVar.value}
            onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
            className="bg-card w-full p-2 text-sm md:text-base border border-border rounded font-body focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('valuePlaceholder')}
          />
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`
          btn-primary w-full md:w-auto text-sm md:text-base px-3 py-2 md:px-4 md:py-2
          disabled:bg-cta-secondary disabled:hover:bg-cta-secondary **:disabled:text-cta-primary
        `}
        disabled={!newVar.key || !newVar.value}
      >
        {t('addButton')}
      </button>
      <Link href="/GET">
        <button className="ml-3 btn-primary w-full md:w-auto text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
          {t('restClient')}
        </button>
      </Link>
    </div>
  );
};
