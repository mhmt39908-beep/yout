import { Video, RefreshCw, CalendarDays } from 'lucide-react';

interface HeaderProps {
  onSync: () => void;
  syncing: boolean;
}

export function Header({ onSync, syncing }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Primal Video Studio</h1>
              <p className="text-xs text-gray-500">Automated video generation & publishing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              Sync Sheets
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
