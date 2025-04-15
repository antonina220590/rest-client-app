'use client';

import { ReduxProvider } from '@/app/store/providers';
import dynamic from 'next/dynamic';
import Spinner from '@/app/components/Spinner';

const VariablesList = dynamic(() => import('./VariablesList'), {
  loading: () => (
    <div className="p-3 flex justify-center items-center h-full">
      <Spinner />
    </div>
  ),
  ssr: false,
});

export default function VariablesListWrapper() {
  return (
    <ReduxProvider>
      <VariablesList />
    </ReduxProvider>
  );
}
