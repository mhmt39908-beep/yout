import { CheckCircle2, Clock, AlertCircle, Zap, Upload } from 'lucide-react';

interface StatusPanelProps {
  processing: number;
  pending: number;
  completed: number;
  failed: number;
}

export function StatusPanel({ processing, pending, completed, failed }: StatusPanelProps) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Processing</p>
            <p className="text-2xl font-bold text-gray-900">{processing}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Ready</p>
            <p className="text-2xl font-bold text-gray-900">{completed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Failed</p>
            <p className="text-2xl font-bold text-gray-900">{failed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Upload className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-gray-900">{pending + processing + completed + failed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
