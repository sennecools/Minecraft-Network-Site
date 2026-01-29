'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, Line
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft, Circle, Users, Copy, Check, Server as ServerIcon,
  Wifi, Download, ExternalLink, Archive, TrendingUp, Sparkles
} from 'lucide-react';
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
  modpack_url?: string;
  is_closed?: boolean;
  world_download_url?: string;
  season?: number;
}

interface AnalyticsData {
  summary: {
    uptime_percent: number;
    avg_players: number;
    peak_players: number;
    total_snapshots: number;
  };
  data: Array<{
    timestamp: string;
    online: boolean;
    player_count: number;
    max_players: number;
    latency: number | null;
  }>;
}

interface PredictionData {
  predictions: Array<{
    timestamp: string;
    predicted_players: number;
  }>;
  stats: {
    overall_avg: number;
    peak_players: number;
    data_points: number;
  };
}

function PlayerChart({ serverId }: { serverId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, predictionsRes] = await Promise.all([
          fetch(`/api/analytics/server/${serverId}?range=24h`),
          fetch(`/api/analytics/predictions/${serverId}?range=24h`)
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }

        if (predictionsRes.ok) {
          const data = await predictionsRes.json();
          setPredictions(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [serverId]);

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">Player Activity</CardTitle>
          <CardDescription className="text-zinc-500">Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full bg-zinc-800" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.data.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">Player Activity</CardTitle>
          <CardDescription className="text-zinc-500">Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-zinc-500">
            No data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate time scale: ~19 hours past + ~5 hours future (for predictions)
  const now = new Date();
  const nowTimestamp = now.getTime();
  const pastHours = 19;
  const futureHours = 5;
  const totalHours = pastHours + futureHours; // 24 hours total
  const startTime = new Date(now.getTime() - pastHours * 60 * 60 * 1000);
  const endTime = new Date(now.getTime() + futureHours * 60 * 60 * 1000);
  const intervalMinutes = 30;
  const totalSlots = Math.floor((totalHours * 60) / intervalMinutes);

  const timeSlots: Date[] = [];
  for (let i = 0; i < totalSlots; i++) {
    timeSlots.push(new Date(startTime.getTime() + i * intervalMinutes * 60 * 1000));
  }

  // Generate hourly tick values for X-axis
  const hourlyTicks: number[] = [];
  for (let i = 0; i <= totalHours; i += 2) { // Every 2 hours to avoid crowding
    hourlyTicks.push(startTime.getTime() + i * 60 * 60 * 1000);
  }

  // Aggregate analytics data to hourly - take highest player count per hour
  const hourlyData: Record<number, number> = {};
  for (const item of analytics.data) {
    if (!item.online) continue;
    const itemTime = new Date(item.timestamp);
    // Round down to the hour
    const hourKey = new Date(
      itemTime.getFullYear(),
      itemTime.getMonth(),
      itemTime.getDate(),
      itemTime.getHours()
    ).getTime();

    if (hourKey >= startTime.getTime() && hourKey <= endTime.getTime()) {
      // Take the highest player count for this hour
      hourlyData[hourKey] = Math.max(hourlyData[hourKey] || 0, item.player_count);
    }
  }

  // Build chart data from hourly aggregated data points
  const analyticsPoints = Object.entries(hourlyData)
    .map(([ts, players]) => ({
      timestamp: parseInt(ts),
      players: players,
      predicted: null as number | null,
      isFuture: false,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Build prediction points for the future (after "now")
  const predictionPoints = predictions
    ? predictions.predictions
        .filter(pred => {
          const ts = new Date(pred.timestamp).getTime();
          return ts > nowTimestamp && ts <= endTime.getTime();
        })
        .map(pred => ({
          timestamp: new Date(pred.timestamp).getTime(),
          players: null as number | null,
          predicted: pred.predicted_players, // Already rounded in API
          isFuture: true,
        }))
    : [];

  // Merge both data sets and sort by timestamp
  const chartData = [...analyticsPoints, ...predictionPoints].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  // Add a "now" point if needed for proper scale
  if (chartData.length === 0 || !chartData.some(d => d.timestamp === nowTimestamp)) {
    // Find the last actual player count to connect the line
    const lastActual = analyticsPoints[analyticsPoints.length - 1];
    chartData.push({
      timestamp: nowTimestamp,
      players: lastActual?.players ?? null,
      predicted: predictionPoints[0]?.predicted ?? null,
      isFuture: false,
    });
    chartData.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Check if we have enough data for predictions
  const hasPredictions = predictions && predictions.stats.data_points >= 12;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-white">Player Activity</CardTitle>
            <CardDescription className="text-zinc-500">Last 24 hours</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-zinc-400">Peak:</span>
              <span className="font-medium text-white">{analytics.summary.peak_players}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-zinc-400">Avg:</span>
              <span className="font-medium text-white">{analytics.summary.avg_players}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={[startTime.getTime(), endTime.getTime()]}
              ticks={hourlyTicks}
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true
              })}
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <YAxis className="text-muted-foreground" tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(ts) => new Date(ts).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: any, name?: string) => {
                if (value === null) return ['No data', name || ''];
                if (name === 'Players Online') return [value, 'Actual'];
                if (name === 'Predicted') return [value, 'Predicted'];
                return [value, name || ''];
              }}
            />
            <Legend
              content={() => (
                <div className="flex items-center justify-center gap-6 mt-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-emerald-500" />
                    <span className="text-muted-foreground">Players Online</span>
                  </div>
                  {hasPredictions && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 3px, transparent 3px, transparent 6px)' }} />
                      <span className="text-muted-foreground">Predicted</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ef4444 0, #ef4444 4px, transparent 4px, transparent 8px)' }} />
                    <span className="text-muted-foreground">Now</span>
                  </div>
                </div>
              )}
            />
            {/* "Now" reference line */}
            <ReferenceLine
              x={nowTimestamp}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            {/* Predicted players (dashed line for future) */}
            {hasPredictions && (
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Predicted"
                dot={false}
                connectNulls
              />
            )}
            {/* Actual players (solid area for past) */}
            <Area
              type="monotone"
              dataKey="players"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.2}
              strokeWidth={2}
              name="Players Online"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ServerStatusCard({ serverId, isClosed }: { serverId: string; isClosed?: boolean }) {
  const { status, isLoading } = useServerStatus(serverId);

  if (isClosed) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">Server Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge
            variant="secondary"
            className="text-sm px-3 py-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700"
          >
            <Archive className="h-3 w-3 mr-2" />
            Closed
          </Badge>
          <p className="text-sm text-zinc-500 mt-3">
            This server has been archived and is no longer active.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">Server Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-24 bg-zinc-800" />
            <Skeleton className="h-6 w-full bg-zinc-800" />
            <Skeleton className="h-6 w-full bg-zinc-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-zinc-900/50 backdrop-blur-sm",
      status?.online
        ? "border-emerald-500/20"
        : "border-red-500/20"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white">Server Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status badge */}
        <Badge
          variant={status?.online ? 'default' : 'secondary'}
          className={cn(
            "text-sm px-3 py-1.5",
            status?.online
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          )}
        >
          <Circle className={cn(
            "h-2 w-2 mr-2 fill-current",
            status?.online && "animate-pulse"
          )} />
          {status?.online ? 'Online' : 'Offline'}
        </Badge>

        {status?.online && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-zinc-800/50">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-zinc-300">
                <strong className="text-white">{status.playerCount}</strong> / {status.maxPlayers} players online
              </span>
            </div>
            {status.latency && (
              <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-zinc-800/50">
                <Wifi className="h-4 w-4 text-emerald-400" />
                <span className="text-zinc-300">
                  <strong className="text-white">{status.latency}ms</strong> latency
                </span>
              </div>
            )}
            {status.version && (
              <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-zinc-800/50">
                <ServerIcon className="h-4 w-4 text-purple-400" />
                <span className="text-zinc-300">{status.version}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ServerPage({
  params
}: {
  params: Promise<{ serverId: string }>
}) {
  const resolvedParams = use(params);
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchServer() {
      try {
        const res = await fetch(`/api/servers/${resolvedParams.serverId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setNotFoundError(true);
          }
          return;
        }
        const data = await res.json();
        setServer(data);
      } catch (error) {
        console.error('Failed to fetch server:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchServer();
  }, [resolvedParams.serverId]);

  const copyIP = () => {
    if (server) {
      navigator.clipboard.writeText(server.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (notFoundError) {
    notFound();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-32 mb-6" />
            <Skeleton className="h-12 w-96 mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
        </section>
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-32" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!server) {
    return null;
  }

  const isClosed = server.is_closed;

  return (
    <main className="min-h-screen bg-zinc-950 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        {!isClosed && (
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
        )}
      </div>

      {/* Header */}
      <section className={cn(
        "relative py-12 md:py-16 border-b border-zinc-800/50",
        isClosed ? "bg-zinc-900/30" : ""
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <Button variant="ghost" asChild className="mb-4 hover:bg-zinc-800/50">
            <Link href="/servers" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Servers
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-3">
            <h1 className={cn(
              "text-3xl md:text-4xl font-bold",
              isClosed ? "text-zinc-400" : "text-white"
            )}>
              {server.name}
            </h1>
            {server.season && (
              <Badge variant="outline" className={cn(
                "text-sm",
                isClosed
                  ? "border-zinc-700 text-zinc-500"
                  : "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
              )}>
                Season {server.season}
              </Badge>
            )}
            {isClosed && (
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border border-zinc-700">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
          </div>
          <p className={cn(
            "text-base max-w-3xl",
            isClosed ? "text-zinc-500" : "text-zinc-400"
          )}>
            {server.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Player Activity Chart - only for active servers */}
              {!isClosed && (
                <PlayerChart serverId={server.id} />
              )}

              {/* About */}
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">About This Server</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                  <p className="text-zinc-400 leading-relaxed">
                    {server.long_description || server.description}
                  </p>

                  {!isClosed && (
                    <>
                      <h3 className="text-lg font-semibold mt-6 mb-4 text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-400" />
                        Getting Started
                      </h3>
                      <ol className="space-y-3 text-zinc-400">
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center font-medium">1</span>
                          <span>Make sure you have Minecraft {server.minecraft_version} installed</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center font-medium">2</span>
                          <span>
                            Install the {server.name} modpack (version {server.modpack_version})
                            {server.modpack_url && (
                              <a
                                href={server.modpack_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                              >
                                Download here
                              </a>
                            )}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center font-medium">3</span>
                          <span>Launch the game and connect to <code className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-mono text-sm">{server.ip}</code></span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center font-medium">4</span>
                          <span>Join our Discord for support and community updates</span>
                        </li>
                      </ol>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              {server.features && server.features.length > 0 && (
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {server.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm px-3 py-1.5 bg-zinc-800/70 border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Server IP card / World download for closed */}
              {isClosed ? (
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">World Archive</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {server.world_download_url ? (
                      <>
                        <p className="text-sm text-zinc-400">
                          Download the world save from this season to explore or continue offline.
                        </p>
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 border-0">
                          <a
                            href={server.world_download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download World
                            <ExternalLink className="h-3.5 w-3.5 ml-2" />
                          </a>
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-zinc-500">
                        The world archive for this server is not available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-900/50 border-emerald-500/20 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Server Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between bg-zinc-900/70 rounded-xl px-4 py-3 border border-zinc-700/50">
                      <code className="font-mono font-semibold text-emerald-400">{server.ip}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyIP}
                        className="hover:bg-zinc-800"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-zinc-400" />
                        )}
                      </Button>
                    </div>
                    <Button onClick={copyIP} className="w-full bg-emerald-600 hover:bg-emerald-500 border-0">
                      {copied ? 'Copied!' : 'Copy IP Address'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Status card */}
              <ServerStatusCard serverId={server.id} isClosed={isClosed} />

              {/* Modpack Download - for active servers */}
              {!isClosed && server.modpack_url && (
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Modpack</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-zinc-400">
                      Download and install the modpack to play on this server.
                    </p>
                    <Button asChild variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600">
                      <a
                        href={server.modpack_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Modpack
                        <ExternalLink className="h-3.5 w-3.5 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Version info */}
              <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Version Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <span className="text-sm text-zinc-400">Modpack Version</span>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">{server.modpack_version}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <span className="text-sm text-zinc-400">Minecraft Version</span>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">{server.minecraft_version}</Badge>
                  </div>
                  {server.season && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                      <span className="text-sm text-zinc-400">Season</span>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">{server.season}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
