'use client';
import { ReduxProvider } from '../../store/providers';
import VariablesList from '../../components/variables/VariablesList';

export default function VariablesPage() {
  return (
    <ReduxProvider>
      <VariablesList />
    </ReduxProvider>
  );
}
