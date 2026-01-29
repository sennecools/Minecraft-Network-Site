import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ServerForm from '@/components/admin/ServerForm';
import { Button } from '@/components/ui/button';

export default async function NewServerPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
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
          <h1 className="text-2xl font-bold tracking-tight">Add Server</h1>
          <p className="text-muted-foreground">Create a new Minecraft server</p>
        </div>
      </div>

      <ServerForm mode="create" />
    </div>
  );
}
