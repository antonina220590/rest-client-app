'use client';
import { useRef, useEffect, useState } from 'react';
import { VariableItemProps } from '@/app/interfaces';
import { useTranslations } from 'next-intl';

const DISPLAY_KEY_LENGTH = 30;
const DISPLAY_VALUE_LENGTH = 50;

export const VariableItem = ({
  variable,
  onEdit,
  onSave,
  onDelete,
  onCopy,
  copiedId,
  editingId,
  editingField,
}: VariableItemProps) => {
  const t = useTranslations('VariablesEditor');
  const editRef = useRef<HTMLDivElement>(null);
  const [editedValue, setEditedValue] = useState(
    variable[editingField || 'key']
  );

  useEffect(() => {
    if (editingId === variable.id && editRef.current) {
      editRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(editRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editingId, variable.id]);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const handleSave = () => {
    onSave({
      ...variable,
      [editingField as string]: editedValue,
    });
  };

  return (
    <div className="bg-card p-4 rounded-xl shadow-md relative group transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span
          onClick={() => onCopy(`{{${variable.key}}}`, variable.id)}
          className="font-code text-xs md:text-sm bg-muted px-2 py-1 rounded cursor-pointer hover:bg-accent transition-colors text-card-foreground relative"
          title={t('copyTooltip')}
        >
          {`{{${truncateText(variable.key, DISPLAY_KEY_LENGTH)}}}`}
          {copiedId === variable.id && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-md">
              {t('copiedText')}
            </span>
          )}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(variable.id);
          }}
          className="text-destructive hover:text-destructive/80 transition-transform transform hover:scale-110 ml-2 cursor-pointer"
          aria-label={t('deleteAriaLabel')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5"
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

      <div className="w-full grid grid-cols-4 gap-2">
        <div className="col-span-2">
          <div className="text-xs text-muted-foreground mb-1">
            {t('keyLabel')}:
          </div>
          {editingId === variable.id && editingField === 'key' ? (
            <input
              ref={editRef as React.RefObject<HTMLInputElement>}
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="font-body text-sm md:text-base text-card-foreground border-b border-border focus:outline-none w-full break-words pb-1"
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          ) : (
            <div
              className="w-full overflow-hidden cursor-pointer"
              onClick={() => {
                setEditedValue(variable.key);
                onEdit(variable, 'key');
              }}
            >
              <span
                className="block font-body text-sm md:text-base text-card-foreground whitespace-nowrap overflow-hidden text-ellipsis"
                title={variable.key}
              >
                {truncateText(variable.key, DISPLAY_KEY_LENGTH)}
              </span>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <div className="text-xs text-muted-foreground mb-1">
            {t('valueLabel')}:
          </div>
          {editingId === variable.id && editingField === 'value' ? (
            <input
              ref={editRef as React.RefObject<HTMLInputElement>}
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="font-body text-sm md:text-base text-card-foreground border-b border-border focus:outline-none w-full break-words pb-1"
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          ) : (
            <div
              className="w-full overflow-hidden cursor-pointer"
              onClick={() => {
                setEditedValue(variable.value);
                onEdit(variable, 'value');
              }}
            >
              <span
                className="block font-body text-sm md:text-base text-card-foreground whitespace-nowrap overflow-hidden text-ellipsis"
                title={variable.value}
              >
                {truncateText(variable.value, DISPLAY_VALUE_LENGTH)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
