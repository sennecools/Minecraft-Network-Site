'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { ChevronLeft, TrendingUp, Users, Server, AlertCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  server_id: string;
  range: string;
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
    version: string | null;
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
  };
}

interface ServerData {
  id: string;
  name: string;
}

interface CurrentStatus {
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  version: string | null;
  latency: number | null;
}

export default function ServerAnalyticsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const [range, setRange] = useState('24h');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [server, setServer] = useState<ServerData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchPredictions();
    fetchServerInfo();
    fetchCurrentStatus();
  }, [resolvedParams.id, range]);

  const fetchServerInfo = async () => {
    try {
      const res = await fetch(`/api/servers/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setServer(data);
      }
    } catch (err) {
      console.error('Failed to fetch server info:', err);
    }
  };

  const fetchCurrentStatus = async () => {
    try {
      const res = await fetch(`/api/server-status?id=${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch current status:', err);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analytics/server/${resolvedParams.id}?range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`/api/analytics/predictions/${resolvedParams.id}?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
      }
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/analytics">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          </div>
        </div>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">{error || 'No data available'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try selecting a different time range or check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate full time scale based on selected range
  const generateTimeScale = () => {
    const now = new Date();
    const rangeHours: Record<string, number> = {
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
      '90d': 24 * 90,
    };
    const hours = rangeHours[range] || 24;

    // Calculate interval based on range (more points for longer ranges would be too dense)
    const intervalMinutes = range === '24h' ? 30 : range === '7d' ? 120 : range === '30d' ? 360 : 720;
    const totalPoints = Math.floor((hours * 60) / intervalMinutes);

    // ~80% past, ~20% future (so "now" is near the right side but with some prediction space)
    const pastHours = Math.floor(hours * 0.8);
    const futureHours = hours - pastHours;
    const startTime = new Date(now.getTime() - pastHours * 60 * 60 * 1000);
    const endTime = new Date(now.getTime() + futureHours * 60 * 60 * 1000);

    const timeSlots: Date[] = [];
    for (let i = 0; i < totalPoints; i++) {
      timeSlots.push(new Date(startTime.getTime() + i * intervalMinutes * 60 * 1000));
    }

    // Generate hourly tick values based on range
    const tickInterval = range === '24h' ? 2 : range === '7d' ? 12 : range === '30d' ? 24 : 48; // hours between ticks
    const hourlyTicks: number[] = [];
    for (let i = 0; i <= hours; i += tickInterval) {
      hourlyTicks.push(startTime.getTime() + i * 60 * 60 * 1000);
    }

    return { timeSlots, now, futureHours, startTime, endTime, hourlyTicks };
  };

  const { timeSlots, now, startTime, endTime, hourlyTicks } = generateTimeScale();
  const nowTimestamp = now.getTime();

  // Aggregate data to hourly - take highest player count and average latency per hour
  const hourlyData: Record<number, { players: number; latency: number | null; latencyCount: number; online: boolean }> = {};
  for (const item of analytics.data) {
    const itemTime = new Date(item.timestamp);
    // Round down to the hour
    const hourKey = new Date(
      itemTime.getFullYear(),
      itemTime.getMonth(),
      itemTime.getDate(),
      itemTime.getHours()
    ).getTime();

    if (hourKey >= startTime.getTime() && hourKey <= endTime.getTime()) {
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { players: 0, latency: null, latencyCount: 0, online: false };
      }
      if (item.online) {
        hourlyData[hourKey].players = Math.max(hourlyData[hourKey].players, item.player_count);
        hourlyData[hourKey].online = true;
        if (item.latency) {
          hourlyData[hourKey].latency = (hourlyData[hourKey].latency || 0) + item.latency;
          hourlyData[hourKey].latencyCount++;
        }
      }
    }
  }

  // Build chart data from hourly aggregated data
  const chartData = Object.entries(hourlyData)
    .map(([ts, data]) => {
      const timestamp = parseInt(ts);
      const avgLatency = data.latencyCount > 0 ? Math.round((data.latency || 0) / data.latencyCount) : null;
      return {
        timestamp,
        time: new Date(timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        players: data.online ? data.players : null,
        predicted: null as number | null,
        latency: avgLatency,
        online: data.online ? 1 : 0,
        isFuture: timestamp > nowTimestamp,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  // Ensure we have a point at "now" for proper scale
  if (chartData.length === 0 || chartData[chartData.length - 1].timestamp < nowTimestamp) {
    chartData.push({
      timestamp: nowTimestamp,
      time: now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      players: null as number | null,
      predicted: null as number | null,
      latency: null as number | null,
      online: 0,
      isFuture: false,
    });
  }

  const ranges = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/analytics">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {server?.name || 'Server Analytics'}
            </h1>
            <p className="text-muted-foreground">Performance metrics and statistics</p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 rounded-lg border p-1">
          {ranges.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Status Banner */}
      {currentStatus && (
        <Card className={currentStatus.online ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${currentStatus.online ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <Circle className={`h-3 w-3 fill-current ${currentStatus.online ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">
                  {currentStatus.online ? 'Online' : 'Offline'}
                </span>
              </div>
              {currentStatus.online && (
                <>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {currentStatus.playerCount} / {currentStatus.maxPlayers} players
                    </span>
                  </div>
                  {currentStatus.latency && (
                    <>
                      <div className="h-4 w-px bg-border" />
                      <Badge variant="secondary">{currentStatus.latency}ms</Badge>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Live Status
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.uptime_percent}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.total_snapshots} snapshots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Players</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.avg_players}</div>
            <p className="text-xs text-muted-foreground">Average online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peak Players</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.peak_players}</div>
            <p className="text-xs text-muted-foreground">Maximum recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.total_snapshots}</div>
            <p className="text-xs text-muted-foreground">5-minute intervals</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Count Chart with Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Player Count Over Time</CardTitle>
          <CardDescription>
            Actual players (solid blue) vs predicted based on historical averages (dashed green). Vertical line marks current time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={[startTime.getTime(), endTime.getTime()]}
                ticks={hourlyTicks}
                tickFormatter={(ts) => {
                  const date = new Date(ts);
                  if (range === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis className="text-muted-foreground" />
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
                  if (value === null) return ['No data', name ?? ''];
                  if (name === 'Players Online') return [value, 'Actual'];
                  if (name === 'Predicted') return [value, 'Predicted'];
                  return [value, name ?? ''];
                }}
              />
              <Legend />
              {/* "Now" reference line */}
              <ReferenceLine
                x={nowTimestamp}
                stroke="#ef4444"
                strokeWidth={2}
                label={{
                  value: 'Now',
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 12,
                }}
              />
              {/* Predicted line (dashed, for future) */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#22c55e"
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Predicted"
                dot={false}
                connectNulls
              />
              {/* Actual players (solid area, for past) */}
              <Area
                type="monotone"
                dataKey="players"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Players Online"
                connectNulls
              />
              {/* Reference line for average */}
              {predictions && (
                <ReferenceLine
                  y={predictions.stats.overall_avg}
                  stroke="#71717a"
                  strokeDasharray="3 3"
                  label={{
                    value: `Avg: ${predictions.stats.overall_avg}`,
                    position: 'insideTopRight',
                    fill: '#71717a',
                    fontSize: 12,
                  }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Latency Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Server Latency</CardTitle>
          <CardDescription>Response time in milliseconds (only available for servers using modern protocol)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.filter(d => !d.isFuture)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                ticks={hourlyTicks.filter(t => t <= nowTimestamp)}
                tickFormatter={(ts) => {
                  const date = new Date(ts);
                  if (range === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis className="text-muted-foreground" />
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
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#f59e0b"
                name="Latency (ms)"
                connectNulls
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Uptime Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Server Uptime Status</CardTitle>
          <CardDescription>Online/offline status over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData.filter(d => !d.isFuture)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                ticks={hourlyTicks.filter(t => t <= nowTimestamp)}
                tickFormatter={(ts) => {
                  const date = new Date(ts);
                  if (range === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(value) => value === 1 ? 'Online' : 'Offline'}
                className="text-muted-foreground"
              />
              <Tooltip
                labelFormatter={(ts) => new Date(ts).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                formatter={(value: any) => [value === 1 ? 'Online' : value === 0 ? 'Offline' : 'No data', 'Status']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="stepAfter"
                dataKey="online"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                name="Status"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
