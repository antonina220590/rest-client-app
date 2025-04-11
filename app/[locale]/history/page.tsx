import { ReduxProvider } from '@/app/store/providers';
import HistoryList from '@/app/components/history/HistoryList';

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-4">
      <ReduxProvider>
        <HistoryList />
      </ReduxProvider>
    </div>
  );
}
