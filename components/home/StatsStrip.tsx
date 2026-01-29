'use client';

import { useEffect, useState } from 'react';
import { Server, Users } from 'lucide-react';
import { motion } from 'framer-motion';

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

interface Stats {
  serverCount: number;
  totalPlayers: number;
  discordMembers: number;
}

export default function StatsStrip() {
  const [stats, setStats] = useState<Stats>({
    serverCount: 0,
    totalPlayers: 0,
    discordMembers: 1000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch servers
        const serversRes = await fetch('/api/servers');
        const servers = await serversRes.json();

        // Count only active (not closed) servers
        const activeServers = servers.filter((s: any) => !s.is_closed);

        // Fetch status for each server to get player counts
        let totalPlayers = 0;
        for (const server of activeServers) {
          try {
            const statusRes = await fetch(`/api/server-status?id=${server.id}`);
            const status = await statusRes.json();
            if (status.online) {
              totalPlayers += status.playerCount;
            }
          } catch (e) {
            // Skip if status fetch fails
          }
        }

        // Fetch Discord member count
        let discordMembers = 1000;
        try {
          const discordRes = await fetch('/api/discord');
          const discordData = await discordRes.json();
          discordMembers = discordData.memberCount || 1000;
        } catch (e) {
          // Keep fallback
        }

        setStats({
          serverCount: activeServers.length,
          totalPlayers,
          discordMembers,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Server,
      value: stats.serverCount,
      label: 'Active Servers',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: Users,
      value: stats.totalPlayers,
      label: 'Online Now',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      icon: DiscordIcon,
      value: stats.discordMembers,
      label: 'Discord Members',
      suffix: '+',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <section className="py-8 bg-zinc-900/50 border-y border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
          {statItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`text-center p-4 rounded-xl ${item.bg} border ${item.border} transition-all cursor-default`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <item.icon className={`h-5 w-5 ${item.color} hidden sm:block`} />
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {loading ? '-' : `${item.value}${item.suffix || ''}`}
                </span>
              </div>
              <p className={`text-xs md:text-sm font-medium ${item.color}`}>
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
