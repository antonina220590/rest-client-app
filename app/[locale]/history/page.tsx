'use client';
import { ReduxProvider } from '@/app/store/providers';
import dynamic from 'next/dynamic';
import Spinner from '@/app/components/Spinner';

const LazyHistoryList = dynamic(
  () => import('@/app/components/history/HistoryList'),
  {
    loading: () => (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    ),
    ssr: false,
  }
);

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-4">
      <ReduxProvider>
        <LazyHistoryList />
      </ReduxProvider>
    </div>
  );
}
