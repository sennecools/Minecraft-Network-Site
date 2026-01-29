import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Server as ServerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

async function getServers() {
  const result = await sql`
    SELECT id, name, ip, port, is_active, is_closed, season, display_order, created_at
    FROM servers
    ORDER BY display_order ASC, name ASC
  `;
  return result.rows;
}

export default async function ServersPage() {
  const session = await getCurrentSession();
  if (!session) {
    redirect('/admin/login');
  }

  const servers = await getServers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Servers</h1>
          <p className="text-muted-foreground">Manage your Minecraft servers</p>
        </div>
        <Button asChild>
          <Link href="/admin/servers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Server
          </Link>
        </Button>
      </div>

      {/* Servers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Servers</CardTitle>
          <CardDescription>
            {servers.length} server{servers.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ServerIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold">No servers yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first server to get started
              </p>
              <Button asChild>
                <Link href="/admin/servers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Server
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server: any) => (
                  <TableRow key={server.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{server.name}</p>
                        <p className="text-xs text-muted-foreground">{server.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {server.ip}:{server.port}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Badge variant={server.is_active ? 'default' : 'secondary'}>
                          {server.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {server.is_closed && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-600">
                            Closed
                          </Badge>
                        )}
                        {server.season && (
                          <Badge variant="outline" className="text-muted-foreground">
                            S{server.season}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {server.display_order}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/servers/${server.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
