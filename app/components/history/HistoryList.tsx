'use client';
import {
  useHistoryItems,
  useClearHistory,
  useDeleteHistoryItem,
} from '@/app/hooks/historyHooks';
import Link from 'next/link';
import HistoryItem from './HistoryItem';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { AppDispatch } from '@/app/store/store';
import { useDispatch } from 'react-redux';
import {
  setHeaders,
  setMethod,
  setRequestBody,
  setUrl,
} from '@/app/store/restClientSlice';
import { HistoryItem as HistoryItemType } from '@/app/interfaces';

export default function HistoryList() {
  const t = useTranslations('HistoryList');
  const items = useHistoryItems();
  const clearHistory = useClearHistory();
  const deleteHistoryItem = useDeleteHistoryItem();

  const dispatch: AppDispatch = useDispatch();

  const handleLinkCallback = (item: HistoryItemType) => {
    dispatch(setMethod(item.method));
    dispatch(setUrl(item.url));
    dispatch(setRequestBody(item.body));
    dispatch(
      setHeaders(
        item.headers.length
          ? []
          : item.headers.map((header) => ({
              id: crypto.randomUUID(),
              key: header.key,
              value: header.value,
            }))
      )
    );
  };

  const handleClearHistory = () => {
    try {
      clearHistory();
      toast.success(t('success.cleared'));
    } catch {
      toast.error(t('error.clearFailed'));
    }
  };

  const handleDeleteItem = (id: string) => {
    try {
      deleteHistoryItem(id);
      toast.success(t('success.deleted'));
    } catch {
      toast.error(t('error.deleteFailed'));
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <h2 className="text-xl font-heading mb-4 text-foreground">
          {t('emptyTitle')}
        </h2>
        <p className="mb-6 text-muted-foreground">{t('emptyDescription')}</p>
        <Link href="/rest-client">
          <button className="btn-primary w-full md:w-auto text-sm md:text-base px-3 py-2 md:px-4 md:py-2">
            {t('goToClientButton')}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {t('title')}
        </h1>
        <button
          onClick={handleClearHistory}
          aria-label={t('clearButton')}
          className="btn-primary w-full md:w-auto text-sm md:text-base px-3 py-2 md:px-4 md:py-2"
        >
          {t('clearButton')}
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            onDelete={handleDeleteItem}
            translations={{
              method: t('methodLabel'),
              url: t('urlLabel'),
              time: t('timeLabel'),
              bodyType: t('bodyTypeLabel'),
              copyTooltip: t('copyLinkTooltip'),
            }}
            callback={() => handleLinkCallback(item)}
          />
        ))}
      </div>
      <Toaster />
    </div>
  );
}
