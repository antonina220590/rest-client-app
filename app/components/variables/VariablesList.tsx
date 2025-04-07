'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addVariable, deleteVariable } from '../../store/variablesSlice';
import { useTranslations } from 'next-intl';

export default function VariablesList() {
  const t = useTranslations('VariablesList');
  const variables = useAppSelector((state) => state.variables);
  const dispatch = useAppDispatch();
  const [newVar, setNewVar] = useState({ key: '', value: '' });
  const [isClient, setIsClient] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAdd = () => {
    if (newVar.key && newVar.value) {
      dispatch(addVariable(newVar));
      setNewVar({ key: '', value: '' });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl font-bold mb-6 text-bg-secondary">
        {t('title')}
      </h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-bg-secondary">
              {t('keyLabel')}
            </label>
            <input
              value={newVar.key}
              onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
              className="w-full p-2 border rounded font-body focus:outline-none focus:ring-2 focus:ring-cta-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-bg-secondary">
              {t('valueLabel')}
            </label>
            <input
              value={newVar.value}
              onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
              className="w-full p-2 border rounded font-body focus:outline-none focus:ring-2 focus:ring-cta-primary"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary"
          disabled={!newVar.key || !newVar.value}
        >
          {t('addButton')}
        </button>
      </div>

      <div className="space-y-3">
        {variables.map((variable) => (
          <div
            key={variable.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <span
                onClick={() =>
                  copyToClipboard(`{{${variable.key}}}`, variable.id)
                }
                className="font-code bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 transition-colors text-bg-secondary relative"
                title={t('copyTooltip')}
              >
                {`{{${variable.key}}}`}
                {copiedId === variable.id && (
                  <span className="absolute -top-8 -right-2 bg-black text-white text-xs px-2 py-1 rounded">
                    {t('copiedText')}
                  </span>
                )}
              </span>
              <span className="font-body text-bg-secondary">
                {variable.value}
              </span>
            </div>
            <button
              onClick={() => dispatch(deleteVariable(variable.id))}
              className="text-red-700 hover:text-red-800 transition-all cursor-pointer duration-200 transform hover:scale-110"
              aria-label={t('deleteAriaLabel')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
