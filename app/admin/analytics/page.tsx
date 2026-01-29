import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getServers() {
  const result = await sql`
    SELECT id, name FROM servers WHERE is_active = true ORDER BY display_order ASC, name ASC
  `;
  return result.rows;
}

export default async function AnalyticsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const servers = await getServers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Server performance and player statistics</p>
      </div>

      {/* Server Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Server</CardTitle>
          <CardDescription>Choose a server to view detailed analytics</CardDescription>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold">No servers available</h3>
              <p className="text-sm text-muted-foreground">
                Add servers to start tracking analytics
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servers.map((server: any) => (
                <Link
                  key={server.id}
                  href={`/admin/analytics/${server.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <h3 className="font-semibold">{server.name}</h3>
                    <p className="text-sm text-muted-foreground">View analytics</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="flex items-start gap-4 pt-6">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Analytics Collection
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Server analytics are automatically collected every 5 minutes via Vercel Cron Job.
              Select a server above to view detailed charts and statistics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
