'use client';

import { ReduxProvider } from '@/app/store/providers';
import dynamic from 'next/dynamic';

const VariablesList = dynamic(() => import('./VariablesList'), {
  loading: () => <div className="p-4">Loading variables...</div>,
  ssr: false,
});

export default function VariablesListWrapper() {
  return (
    <ReduxProvider>
      <VariablesList />
    </ReduxProvider>
  );
}
