import { PlayerStats } from '@/lib/types';

interface LeaderboardProps {
  title: string;
  players: PlayerStats[];
  metric: string;
}

export default function Leaderboard({ title, players, metric }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {players.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No data available yet
          </div>
        ) : (
          players.map((player, index) => (
            <div
              key={player.uuid}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    index === 0
                      ? 'bg-yellow-500 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {index + 1}
                </div>

                <div>
                  <div className="font-semibold text-gray-900">{player.username}</div>
                  {player.rank && (
                    <div className="text-xs text-gray-500">{player.rank}</div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {metric === 'playtime'
                    ? `${player.playtime.toLocaleString()}h`
                    : player.playtime}
                </div>
                <div className="text-xs text-gray-500">Last seen: {player.lastSeen}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
