'use client';

import { useServerStatus } from '@/lib/hooks';
import StatusIndicator from './StatusIndicator';

interface ServerStatsProps {
  serverId: string;
}

export default function ServerStats({ serverId }: ServerStatsProps) {
  const { status, isLoading } = useServerStatus(serverId);

  const stats = [
    {
      label: 'Status',
      value: isLoading ? (
        'Checking...'
      ) : status ? (
        <StatusIndicator online={status.online} />
      ) : (
        'Unknown'
      ),
    },
    {
      label: 'Players Online',
      value: status?.online
        ? `${status.playerCount} / ${status.maxPlayers}`
        : 'N/A',
    },
    {
      label: 'Latency',
      value: status?.online && status.latency ? `${status.latency}ms` : 'N/A',
    },
    {
      label: 'Server Version',
      value: status?.version || 'N/A',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
          <div className="text-2xl font-bold text-gray-900">
            {typeof stat.value === 'string' ? stat.value : stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
