'use client';
import { ReduxProvider } from '../store/providers';
import VariablesList from '../components/main-route/Variables/VariablesList';

export default function VariablesPage() {
  return (
    <ReduxProvider>
      <VariablesList />
    </ReduxProvider>
  );
}
