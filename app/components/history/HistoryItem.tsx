'use client';

import Link from 'next/link';
import { HistoryItemProps } from '@/app/interfaces';
import { cn } from '@/lib/utils';
import { interpolateVariables } from '@/app/components/variables/helpers/interpolate';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';

export default function HistoryItem({ item }: HistoryItemProps) {
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
    params.set('restore', item.id);

    return `/rest-client?${params.toString()}`;
  };

  return (
    <div className="p-3 border rounded-lg hover:bg-accent/10 transition-colors border-border">
      <div className="flex justify-between items-start gap-4">
        <Link href={createRestClientUrl()} className="flex-1 group">
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
        <div className="flex items-center gap-2"></div>
      </div>
    </div>
  );
}
