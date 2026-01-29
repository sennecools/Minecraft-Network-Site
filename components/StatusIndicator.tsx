interface StatusIndicatorProps {
  online: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusIndicator({ online, size = 'md' }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full ${
          online ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}
      ></div>
      <span className="font-semibold text-gray-900">
        {online ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
