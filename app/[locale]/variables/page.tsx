'use client';
import { ReduxProvider } from '@/app/store/providers';
import VariablesList from '@/app/components/variables/VariablesList';

export default function VariablesPage() {
  return (
    <ReduxProvider>
      <VariablesList />
    </ReduxProvider>
  );
}
