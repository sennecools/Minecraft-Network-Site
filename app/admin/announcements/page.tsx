import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Megaphone, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function getAnnouncements() {
  const result = await sql`
    SELECT id, title, author, type, is_published, is_pinned, created_at, published_at
    FROM announcements
    ORDER BY is_pinned DESC, created_at DESC
  `;
  return result.rows;
}

export default async function AnnouncementsPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const announcements = await getAnnouncements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Manage news and updates</p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Link>
        </Button>
      </div>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold">No announcements yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first announcement
              </p>
              <Button asChild>
                <Link href="/admin/announcements/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement: any) => (
                <Link
                  key={announcement.id}
                  href={`/admin/announcements/${announcement.id}/edit`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium leading-none">{announcement.title}</p>
                      {announcement.is_pinned && (
                        <Badge variant="outline" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>By {announcement.author}</span>
                      <span>-</span>
                      <span className="capitalize">{announcement.type}</span>
                      <span>-</span>
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
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
  );
}
