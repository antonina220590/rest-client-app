'use client';

import { ReduxProvider } from '@/app/store/providers';
import dynamic from 'next/dynamic';
import Spinner from '@/app/components/Spinner';
import { Toaster } from 'sonner';

const VariablesEditor = dynamic(
  () => import('@/app/components/variables/VariablesEditor'),
  {
    loading: () => (
      <div className="p-3 flex justify-center items-center h-screen">
        <Spinner />
      </div>
    ),
    ssr: false,
  }
);

export default function VariablesList() {
  return (
    <ReduxProvider>
      <VariablesEditor />
      <Toaster />
    </ReduxProvider>
  );
}
