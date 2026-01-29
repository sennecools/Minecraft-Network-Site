import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import AnnouncementForm from '@/components/admin/AnnouncementForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAnnouncement(id: string) {
  const result = await sql`
    SELECT * FROM announcements WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function getServers() {
  const result = await sql`
    SELECT id, name FROM servers WHERE is_active = true ORDER BY name ASC
  `;
  return result.rows;
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const [announcement, servers] = await Promise.all([
    getAnnouncement(id),
    getServers(),
  ]);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/announcements">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Announcement</h1>
          <p className="text-muted-foreground">{announcement.title}</p>
        </div>
      </div>

      <AnnouncementForm
        mode="edit"
        announcement={announcement}
        servers={servers}
      />
    </div>
  );
}
