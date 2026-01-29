import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Server, Megaphone, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

async function getDashboardStats() {
  const serversResult = await sql`
    SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active
    FROM servers
  `;
  const announcementsResult = await sql`
    SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_published = true) as published
    FROM announcements
  `;
  return {
    servers: {
      total: parseInt(serversResult.rows[0].total),
      active: parseInt(serversResult.rows[0].active),
    },
    announcements: {
      total: parseInt(announcementsResult.rows[0].total),
      published: parseInt(announcementsResult.rows[0].published),
    },
  };
}

async function getRecentServers() {
  const result = await sql`
    SELECT id, name, is_active, created_at
    FROM servers
    ORDER BY created_at DESC
    LIMIT 5
  `;
  return result.rows;
}

async function getRecentAnnouncements() {
  const result = await sql`
    SELECT id, title, is_published, created_at
    FROM announcements
    ORDER BY created_at DESC
    LIMIT 5
  `;
  return result.rows;
}

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const stats = await getDashboardStats();
  const recentServers = await getRecentServers();
  const recentAnnouncements = await getRecentAnnouncements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{session.username}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.servers.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.servers.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.announcements.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.announcements.published} published
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/admin/servers/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Server
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/announcements/new">
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Servers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Servers</CardTitle>
              <CardDescription>Your latest server configurations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/servers">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentServers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No servers yet. Add your first server to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentServers.map((server: any) => (
                  <Link
                    key={server.id}
                    href={`/admin/servers/${server.id}/edit`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{server.name}</p>
                      <p className="text-xs text-muted-foreground">{server.id}</p>
                    </div>
                    <Badge variant={server.is_active ? 'default' : 'secondary'}>
                      {server.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Your latest announcements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/announcements">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No announcements yet. Create your first announcement.
              </p>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement: any) => (
                  <Link
                    key={announcement.id}
                    href={`/admin/announcements/${announcement.id}/edit`}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={announcement.is_published ? 'default' : 'secondary'}>
                      {announcement.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
