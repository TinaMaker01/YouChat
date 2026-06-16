import { LoadingSpinner } from '@/components/loading-spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner />
        <p className="text-gray-400 animate-pulse font-medium">Loading content...</p>
      </div>
    </div>
  );
}
