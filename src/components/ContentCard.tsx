import { ContentItem } from '../lib/supabase';
import { format, parseISO, addMinutes, addHours } from 'date-fns';
import { Video, Youtube, Clock, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

interface ContentCardProps {
  item: ContentItem;
  onGenerate: () => void;
  onUpload: () => void;
  processing: boolean;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Pending' },
  processing: { icon: Loader, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing' },
  video_ready: { icon: Video, color: 'text-green-600', bg: 'bg-green-50', label: 'Video Ready' },
  completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
};

export function ContentCard({ item, onGenerate, onUpload, processing }: ContentCardProps) {
  const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  const date = item.date ? parseISO(item.date) : new Date();
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getEstimatedPublishTime = () => {
    if (item.status === 'pending') {
      return addMinutes(new Date(), 15);
    } else if (item.status === 'processing') {
      return addMinutes(new Date(), 8);
    } else if (item.status === 'video_ready') {
      return addMinutes(new Date(), 2);
    }
    return null;
  };

  const estimatedTime = getEstimatedPublishTime();
  const isScheduled = date > new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isToday && (
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                Today
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
          <p className="text-sm text-gray-600">{format(date, 'MMMM d, yyyy')}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          item.format === 'short' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {item.format === 'short' ? 'Short' : 'Long'}
        </span>
      </div>

      {item.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{item.description}</p>
      )}

      {item.video_url && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Video URL</p>
          <a
            href={item.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline truncate block"
          >
            {item.video_url.substring(0, 50)}...
          </a>
        </div>
      )}

      {item.youtube_id && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">YouTube</p>
          <a
            href={`https://www.youtube.com/watch?v=${item.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-red-600 hover:underline"
          >
            Watch on YouTube
          </a>
        </div>
      )}

      {estimatedTime && (item.status === 'pending' || item.status === 'processing' || item.status === 'video_ready') && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-900">
                {isScheduled
                  ? `Scheduled for ${format(date, 'MMM d, yyyy')}`
                  : `Estimated publish: ${format(estimatedTime, 'HH:mm')} today`
                }
              </p>
              {!isScheduled && (
                <p className="text-xs text-amber-700 mt-0.5">
                  Processing time: ~{
                    item.status === 'pending' ? '15 min' :
                    item.status === 'processing' ? '8 min' :
                    '2 min'
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(item.status === 'pending' || item.status === 'failed') && (
          <button
            onClick={onGenerate}
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Video className="w-4 h-4" />
            Generate Video
          </button>
        )}

        {item.status === 'video_ready' && (
          <button
            onClick={onUpload}
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-4 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Youtube className="w-4 h-4" />
            Upload to YouTube
          </button>
        )}
      </div>

      {item.attempts > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-center">Attempts: {item.attempts}</p>
      )}
    </div>
  );
}
