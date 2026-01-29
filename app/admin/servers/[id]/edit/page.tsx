import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import ServerForm from '@/components/admin/ServerForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getServer(id: string) {
  const result = await sql`
    SELECT * FROM servers WHERE id = ${id}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export default async function EditServerPage({ params }: PageProps) {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const server = await getServer(id);

  if (!server) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/servers">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Server</h1>
          <p className="text-muted-foreground">{server.name}</p>
        </div>
      </div>

      <ServerForm mode="edit" server={server} />
    </div>
  );
}
