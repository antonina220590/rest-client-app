'use client';
import Link from 'next/link';
import { HistoryItemProps } from '@/app/interfaces';
import { cn } from '@/lib/utils';
import { interpolateVariables } from '@/app/components/variables/helpers/interpolate';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { encodeToBase64Url } from '../rest-client/helpers/encoding';

export default function HistoryItem({
  item,
  onDelete,
  callback,
}: HistoryItemProps) {
  const variables = useSelector((state: RootState) => state.variables);

  const methodColors: Record<string, string> = {
    GET: 'bg-chart-2',
    POST: 'bg-chart-4',
    PUT: 'bg-chart-5',
    PATCH: 'bg-chart-3',
    DELETE: 'bg-chart-1',
  };

  const createRestClientUrl = () => {
    const params = new URLSearchParams();
    item.headers.forEach((header) => {
      if (header.key) {
        params.append(header.key, header.value || '');
      }
    });
    const body = item.body ? `/${encodeToBase64Url(item.body)}` : '';
    const urlRestore = `/${item.method}/${encodeToBase64Url(item.url)}${body}?${params.toString()}`;
    return urlRestore;
  };

  return (
    <div className="p-4 border rounded-lg transition-all duration-200 border-border/50 bg-background/80 hover:bg-accent/40 shadow-sm hover:shadow-md hover:scale-[1.01]">
      <div className="flex justify-between items-start gap-4">
        <Link
          href={createRestClientUrl()}
          onClick={callback}
          className="flex-1 group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-heading font-bold text-primary-foreground',
                methodColors[item.method] || 'bg-primary'
              )}
            >
              {item.method}
            </span>
            <span className="text-xs text-muted-foreground font-body">
              {new Date(item.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground font-body group-hover:text-primary transition-colors truncate">
            {interpolateVariables(item.url, variables)}
          </p>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="text-destructive hover:text-destructive/80 transition-transform transform hover:scale-110 cursor-pointer"
            aria-label="Delete history item"
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
      </div>
    </div>
  );
}
