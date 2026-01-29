'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Circle, Users, Copy, Check, ChevronRight, Archive, Download, ExternalLink, Server as ServerIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useServerStatus } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  description: string;
  long_description: string | null;
  features: string[];
  modpack_version: string;
  minecraft_version: string;
  is_closed?: boolean;
  world_download_url?: string;
  season?: number;
}

function ServerCard({ server, index }: { server: Server; index: number }) {
  const { status, isLoading } = useServerStatus(server.id);
  const [copied, setCopied] = useState(false);

  const copyIP = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(server.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isClosed = server.is_closed;

  const cardContent = (
        <div
          className={cn(
            "relative p-6 rounded-2xl border transition-all duration-150",
            isClosed
              ? "bg-zinc-900/30 border-zinc-800/50"
              : "bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border-zinc-800 hover:border-emerald-500/50 hover:-translate-y-0.5 backdrop-blur-sm"
          )}
        >
          {/* Subtle gradient overlay for active servers */}
          {!isClosed && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}

          {/* Content */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className={cn(
                    "text-xl font-bold",
                    isClosed ? "text-zinc-400" : "text-white group-hover:text-emerald-400 transition-colors"
                  )}>
                    {server.name}
                  </h2>
                  {server.season && (
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium",
                      isClosed
                        ? "bg-zinc-800/50 text-zinc-500"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    )}>
                      Season {server.season}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-sm line-clamp-2 leading-relaxed",
                  isClosed ? "text-zinc-600" : "text-zinc-400"
                )}>
                  {server.long_description || server.description}
                </p>
              </div>

              {/* Status */}
              {isClosed ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 text-zinc-500 text-sm font-medium shrink-0">
                  <Archive className="h-4 w-4" />
                  Closed
                </div>
              ) : isLoading ? (
                <div className="px-3 py-1.5 rounded-full bg-zinc-800/50 text-sm text-zinc-400 shrink-0 animate-pulse">
                  Loading...
                </div>
              ) : (
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shrink-0",
                  status?.online
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/15 text-red-400 border border-red-500/20"
                )}>
                  <Circle className={cn(
                    "h-2 w-2 fill-current",
                    status?.online && "animate-pulse"
                  )} />
                  {status?.online ? 'Online' : 'Offline'}
                </div>
              )}
            </div>

            {/* Stats row - only for active servers */}
            {!isClosed && status?.online && (
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-white font-medium">{status.playerCount}</span>
                  <span className="text-zinc-500">/ {status.maxPlayers}</span>
                </div>
                {status.latency && (
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-800/50 text-zinc-400">
                    <span className="text-emerald-400 font-medium">{status.latency}</span>ms
                  </div>
                )}
              </div>
            )}

            {/* Bottom section */}
            <div className="flex items-center justify-between gap-4">
              {isClosed ? (
                // World download for closed servers
                server.world_download_url ? (
                  <a
                    href={server.world_download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download World
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-sm text-zinc-600">World archive unavailable</span>
                )
              ) : (
                // IP for active servers
                <div
                  onClick={copyIP}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/70 border border-zinc-700/50 cursor-pointer hover:border-emerald-500/30 hover:bg-zinc-800 transition-all group/ip"
                >
                  <code className="text-sm font-mono text-zinc-300 group-hover/ip:text-emerald-400 transition-colors">
                    {server.ip}
                  </code>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-zinc-500 group-hover/ip:text-zinc-400" />
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Version info */}
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-zinc-800/50 text-zinc-400">{server.modpack_version}</span>
                  <span className="px-2 py-1 rounded bg-zinc-800/50 text-zinc-500">MC {server.minecraft_version}</span>
                </div>

                {/* Arrow */}
                <div className={cn(
                  "p-2 rounded-lg transition-all",
                  isClosed ? "text-zinc-600" : "text-zinc-500 bg-zinc-800/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-400"
                )}>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Features */}
            {!isClosed && server.features && server.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-zinc-800/50">
                {server.features.slice(0, 5).map((feature, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs bg-zinc-800/50 text-zinc-400 border border-zinc-700/30"
                  >
                    {feature}
                  </span>
                ))}
                {server.features.length > 5 && (
                  <span className="px-2.5 py-1 text-xs text-zinc-600">
                    +{server.features.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {isClosed ? (
        // Closed servers: no link wrapper to avoid nested <a> tags with download link
        <div className="group block cursor-pointer" onClick={() => window.location.href = `/servers/${server.id}`}>
          {cardContent}
        </div>
      ) : (
        // Active servers: normal link
        <Link href={`/servers/${server.id}`} className="group block">
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl border bg-zinc-900/50 border-zinc-800 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="h-6 w-48 bg-zinc-800 rounded mb-2" />
          <div className="h-4 w-full bg-zinc-800 rounded" />
        </div>
        <div className="h-8 w-20 bg-zinc-800 rounded-full" />
      </div>
      <div className="h-10 w-40 bg-zinc-800 rounded-lg" />
    </div>
  );
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServers() {
      try {
        // Include closed servers on the servers listing page
        const res = await fetch('/api/servers?includeClosed=true');
        if (res.ok) {
          const data = await res.json();
          setServers(data);
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

  return (
    <main className="min-h-screen bg-zinc-950 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <section className="relative py-12 md:py-16 border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950" />
        <div className="container mx-auto px-4 relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Our Servers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-base text-zinc-400 max-w-2xl"
          >
            Choose your adventure from our selection of modded Minecraft servers.
          </motion.p>
        </div>
      </section>

      {/* Server list */}
      <section className="relative py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : servers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border bg-zinc-900/50 border-zinc-800 py-20 text-center backdrop-blur-sm"
            >
              <div className="p-4 rounded-full bg-zinc-800/50 w-fit mx-auto mb-6">
                <ServerIcon className="h-10 w-10 text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No servers available</h3>
              <p className="text-zinc-400">Check back later for available servers.</p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Active servers */}
              {activeServers.length > 0 && (
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <div className="h-px flex-1 max-w-8 bg-gradient-to-r from-transparent to-emerald-500/50" />
                    <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                      Active Servers
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                  </motion.div>
                  <div className="space-y-4">
                    {activeServers.map((server, index) => (
                      <ServerCard key={server.id} server={server} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Closed servers */}
              {closedServers.length > 0 && (
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <div className="h-px flex-1 max-w-8 bg-gradient-to-r from-transparent to-zinc-600/50" />
                    <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Previous Seasons
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-600/50 to-transparent" />
                  </motion.div>
                  <div className="space-y-4">
                    {closedServers.map((server, index) => (
                      <ServerCard key={server.id} server={server} index={index + activeServers.length} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
