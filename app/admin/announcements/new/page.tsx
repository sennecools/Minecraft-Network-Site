import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import AnnouncementForm from '@/components/admin/AnnouncementForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getServers() {
  const result = await sql`
    SELECT id, name FROM servers WHERE is_active = true ORDER BY name ASC
  `;
  return result.rows;
}

export default async function NewAnnouncementPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const servers = await getServers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/announcements">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Announcement</h1>
          <p className="text-muted-foreground">Create a new announcement for your community</p>
        </div>
      </div>

      <AnnouncementForm mode="create" servers={servers} />
    </div>
  );
}
