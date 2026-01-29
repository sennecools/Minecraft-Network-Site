'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Circle, Users, Copy, Check, ArrowRight, Archive, Download, ExternalLink, Cpu, Zap, Sparkles, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useServerStatus } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  description: string;
  long_description?: string;
  features: string[];
  modpack_version: string;
  minecraft_version?: string;
  is_closed?: boolean;
  world_download_url?: string;
  season?: number;
}

// Different gradient themes for visual variety
const cardThemes = [
  {
    gradient: 'from-emerald-500/20 via-transparent to-transparent',
    accent: 'emerald',
    glow: 'bg-emerald-500/20',
    border: 'hover:border-emerald-500/50',
    text: 'group-hover:text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400',
    icon: Zap,
  },
  {
    gradient: 'from-blue-500/20 via-transparent to-transparent',
    accent: 'blue',
    glow: 'bg-blue-500/20',
    border: 'hover:border-blue-500/50',
    text: 'group-hover:text-blue-400',
    badge: 'bg-blue-500/15 text-blue-400',
    icon: Cpu,
  },
  {
    gradient: 'from-purple-500/20 via-transparent to-transparent',
    accent: 'purple',
    glow: 'bg-purple-500/20',
    border: 'hover:border-purple-500/50',
    text: 'group-hover:text-purple-400',
    badge: 'bg-purple-500/15 text-purple-400',
    icon: Sparkles,
  },
  {
    gradient: 'from-amber-500/20 via-transparent to-transparent',
    accent: 'amber',
    glow: 'bg-amber-500/20',
    border: 'hover:border-amber-500/50',
    text: 'group-hover:text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400',
    icon: Zap,
  },
];

function ServerCard({ server, index, isPopular }: { server: Server; index: number; isPopular?: boolean }) {
  const { status, isLoading } = useServerStatus(server.id);
  const [copied, setCopied] = useState(false);
  const theme = cardThemes[index % cardThemes.length];
  const ThemeIcon = theme.icon;

  const copyIP = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(server.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isClosed = server.is_closed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Link href={`/servers/${server.id}`} className="group block h-full">
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-2xl border transition-all duration-150",
            isClosed
              ? "bg-zinc-900/50 border-zinc-800/50"
              : `bg-zinc-900/80 border-zinc-800 ${theme.border} hover:-translate-y-1`
          )}
        >
          {/* Gradient overlay */}
          {!isClosed && (
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              theme.gradient
            )} />
          )}

          {/* Animated glow on hover */}
          {!isClosed && (
            <motion.div
              className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                theme.glow
              )}
            />
          )}

          <div className="relative p-6 md:p-8">
            {/* Top row: Icon + Tags + Status */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {!isClosed && (
                  <div
                    className={cn(
                      "p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50",
                      "group-hover:border-zinc-600/50 transition-colors duration-150"
                    )}
                  >
                    <ThemeIcon className={cn(
                      "h-6 w-6 text-zinc-400 transition-colors duration-150",
                      theme.text
                    )} />
                  </div>
                )}

                {/* Popular tag - shows on most populated server */}
                {!isClosed && isPopular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold"
                  >
                    <Flame className="h-3 w-3" />
                    Popular
                  </motion.div>
                )}
              </div>

              {isClosed ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-500 text-sm font-medium">
                  <Archive className="h-4 w-4" />
                  Archived
                </div>
              ) : isLoading ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 text-zinc-400 text-sm">
                  <div className="h-2 w-2 bg-zinc-500 rounded-full animate-pulse" />
                  Checking...
                </div>
              ) : (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  status?.online ? theme.badge : "bg-red-500/15 text-red-400"
                )}>
                  <Circle className={cn(
                    "h-2 w-2 fill-current",
                    status?.online && "animate-pulse"
                  )} />
                  {status?.online ? 'Online' : 'Offline'}
                </div>
              )}
            </div>

            {/* Server name and season */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={cn(
                  "text-2xl md:text-3xl font-bold transition-colors",
                  isClosed ? "text-zinc-500" : `text-white ${theme.text}`
                )}>
                  {server.name}
                </h3>
                {server.season && (
                  <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 font-medium">
                    S{server.season}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-sm md:text-base leading-relaxed line-clamp-2",
                isClosed ? "text-zinc-600" : "text-zinc-400"
              )}>
                {server.long_description || server.description}
              </p>
            </div>

            {/* Live stats for active servers */}
            {!isClosed && status?.online && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-6 mb-6 py-3 px-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-zinc-500" />
                  <div>
                    <span className="text-xl font-bold text-white">{status.playerCount}</span>
                    <span className="text-zinc-500 text-sm">/{status.maxPlayers}</span>
                  </div>
                </div>
                {status.latency && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      status.latency < 50 ? "bg-emerald-400" :
                      status.latency < 100 ? "bg-yellow-400" : "bg-red-400"
                    )} />
                    <span className="text-zinc-400">{status.latency}ms</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Features */}
            {!isClosed && server.features && server.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {server.features.slice(0, 3).map((feature, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
                  >
                    {feature}
                  </span>
                ))}
                {server.features.length > 3 && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500">
                    +{server.features.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Bottom section */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
              {isClosed ? (
                server.world_download_url ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(server.world_download_url, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download World
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </button>
                ) : (
                  <span className="text-sm text-zinc-600">World unavailable</span>
                )
              ) : (
                <div
                  onClick={copyIP}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 cursor-pointer hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-150 active:scale-95"
                >
                  <code className="text-sm font-mono text-zinc-300">{server.ip}</code>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-xs text-zinc-500">
                  {server.modpack_version}
                </span>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors duration-150",
                    isClosed ? "text-zinc-600" : `text-zinc-400 ${theme.text}`
                  )}
                >
                  View Details
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-full p-6 md:p-8 rounded-2xl border bg-zinc-900/80 border-zinc-800">
      <div className="flex items-start justify-between mb-6">
        <div className="h-12 w-12 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-8 w-20 bg-zinc-800 rounded-full animate-pulse" />
      </div>
      <div className="mb-4">
        <div className="h-8 w-48 bg-zinc-800 rounded mb-3 animate-pulse" />
        <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded mt-2 animate-pulse" />
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-8 w-24 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-8 w-28 bg-zinc-800 rounded-lg animate-pulse" />
      </div>
      <div className="pt-4 border-t border-zinc-800/50 flex justify-between">
        <div className="h-10 w-40 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-10 w-24 bg-zinc-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function FeaturedServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverStats, setServerStats] = useState<Record<string, { playerCount: number }>>({});

  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await fetch('/api/servers');
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a: Server, b: Server) => {
            if (a.is_closed && !b.is_closed) return 1;
            if (!a.is_closed && b.is_closed) return -1;
            return 0;
          });
          setServers(sorted);

          // Fetch player counts for active servers to determine most popular
          const activeOnes = sorted.filter((s: Server) => !s.is_closed);
          const stats: Record<string, { playerCount: number }> = {};

          await Promise.all(
            activeOnes.map(async (server: Server) => {
              try {
                const statusRes = await fetch(`/api/server-status?id=${server.id}`);
                if (statusRes.ok) {
                  const status = await statusRes.json();
                  stats[server.id] = { playerCount: status.online ? status.playerCount : 0 };
                }
              } catch {
                stats[server.id] = { playerCount: 0 };
              }
            })
          );

          setServerStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch servers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchServers();
  }, []);

  const activeServers = servers.filter(s => !s.is_closed);
  const closedServers = servers.filter(s => s.is_closed);

  // Find the most popular server (highest player count)
  const mostPopularServerId = Object.entries(serverStats)
    .filter(([_, stats]) => stats.playerCount > 0)
    .sort((a, b) => b[1].playerCount - a[1].playerCount)[0]?.[0];

  return (
    <section className="py-20 bg-zinc-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4"
          >
            <Sparkles className="h-4 w-4" />
            Live Servers
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Choose Your Adventure
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Jump into our curated modded Minecraft experiences. Each server offers unique gameplay and community.
          </p>
        </motion.div>

        {/* Server grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active servers */}
            {activeServers.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {activeServers.map((server, index) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    index={index}
                    isPopular={server.id === mostPopularServerId}
                  />
                ))}
              </div>
            )}

            {/* Closed servers */}
            {closedServers.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                  <span className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
                    Previous Seasons
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {closedServers.map((server, index) => (
                    <ServerCard key={server.id} server={server} index={index + activeServers.length} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Link
            href="/servers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white font-medium transition-all group"
          >
            View All Servers
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
