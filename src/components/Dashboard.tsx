import { useState } from 'react';
import { Header } from './Header';
import { ContentCard } from './ContentCard';
import { AddContentModal } from './AddContentModal';
import { useContent } from '../hooks/useContent';
import { useVideoGeneration } from '../hooks/useVideoGeneration';
import { syncFromSheets, uploadToYouTube } from '../lib/api';
import { Loader, AlertCircle, Plus } from 'lucide-react';

export function Dashboard() {
  const { content, loading, error, refetch } = useContent();
  const { generateAndPoll, processing, progress } = useVideoGeneration();
  const [syncing, setSyncing] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncFromSheets();
      await refetch();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerate = async (item: any) => {
    setActiveItem(item.id);
    await generateAndPoll(item);
    await refetch();
    setActiveItem(null);
  };

  const handleUpload = async (item: any) => {
    if (!item.video_url) return;

    setActiveItem(item.id);

    try {
      const description = `${item.description || item.title}\n\n#Shorts #viral #primallife`;
      const result = await uploadToYouTube(
        item.video_url,
        `${item.title} #Shorts`,
        description,
        'mock_token'
      );

      if (result.success) {
        await refetch();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setActiveItem(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSync={handleSync} syncing={syncing} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {processing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Processing...</p>
                <p className="text-sm text-blue-700">{progress}</p>
              </div>
            </div>
          </div>
        )}

        {content.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Content Found</h3>
            <p className="text-gray-500 mb-6">Start by syncing from Google Sheets or add content manually</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSync}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium"
              >
                Sync from Google Sheets
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Content
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Content Calendar</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">{content.length} items</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {content.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onGenerate={() => handleGenerate(item)}
                  onUpload={() => handleUpload(item)}
                  processing={processing && activeItem === item.id}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <AddContentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(contentId) => {
          refetch();
          setTimeout(() => {
            const item = content.find(c => c.id === contentId);
            if (item && item.description) {
              generateAndPoll(item);
            }
          }, 500);
        }}
      />
    </div>
  );
}
