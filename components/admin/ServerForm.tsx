'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ServerFormProps {
  server?: {
    id: string;
    name: string;
    short_name?: string;
    ip: string;
    port: number;
    description: string;
    long_description?: string;
    features: string[];
    modpack_version?: string;
    minecraft_version?: string;
    modpack_url?: string;
    display_order: number;
    is_active: boolean;
    is_closed?: boolean;
    world_download_url?: string;
    season?: number;
  };
  mode: 'create' | 'edit';
}

export default function ServerForm({ server, mode }: ServerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    id: server?.id || '',
    name: server?.name || '',
    short_name: server?.short_name || '',
    ip: server?.ip || '',
    port: server?.port || 25565,
    description: server?.description || '',
    long_description: server?.long_description || '',
    features: server?.features?.join('\n') || '',
    modpack_version: server?.modpack_version || '',
    minecraft_version: server?.minecraft_version || '',
    modpack_url: server?.modpack_url || '',
    display_order: server?.display_order || 0,
    is_active: server?.is_active ?? true,
    is_closed: server?.is_closed ?? false,
    world_download_url: server?.world_download_url || '',
    season: server?.season || 1,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const featuresArray = formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        ...formData,
        features: featuresArray,
        port: parseInt(formData.port.toString()),
        display_order: parseInt(formData.display_order.toString()),
      };

      const url = mode === 'create' ? '/api/servers' : `/api/servers/${server?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save server');
        setLoading(false);
        return;
      }

      router.push('/admin/servers');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to deactivate this server?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/servers/${server?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete server');
        setLoading(false);
        return;
      }

      router.push('/admin/servers');
      router.refresh();
    } catch (err) {
      setError('An error occurred while deleting.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Core server configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="id">Server ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={mode === 'edit'}
                required
                placeholder="atm10"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (lowercase, no spaces)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="All the Mods 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_name">Short Name</Label>
              <Input
                id="short_name"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                placeholder="ATM10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
          <CardDescription>Server address and port</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                required
                placeholder="server.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>Server description and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={2}
              placeholder="Brief description for server cards"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="long_description">Long Description</Label>
            <Textarea
              id="long_description"
              value={formData.long_description}
              onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
              rows={4}
              placeholder="Detailed description for server detail pages"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={4}
              className="font-mono text-sm"
              placeholder="One feature per line&#10;500+ Mods&#10;Custom Quests&#10;Performance Optimized"
            />
            <p className="text-xs text-muted-foreground">One feature per line</p>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardHeader>
          <CardTitle>Version Information</CardTitle>
          <CardDescription>Modpack and Minecraft versions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="modpack_version">Modpack Version</Label>
              <Input
                id="modpack_version"
                value={formData.modpack_version}
                onChange={(e) => setFormData({ ...formData, modpack_version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minecraft_version">Minecraft Version</Label>
              <Input
                id="minecraft_version"
                value={formData.minecraft_version}
                onChange={(e) => setFormData({ ...formData, minecraft_version: e.target.value })}
                placeholder="1.21.1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modpack_url">Modpack Download URL</Label>
            <Input
              id="modpack_url"
              type="url"
              value={formData.modpack_url}
              onChange={(e) => setFormData({ ...formData, modpack_url: e.target.value })}
              placeholder="https://www.curseforge.com/minecraft/modpacks/..."
            />
            <p className="text-xs text-muted-foreground">
              Direct link to download the modpack (CurseForge, Modrinth, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Season & Archive */}
      <Card>
        <CardHeader>
          <CardTitle>Season & Archive</CardTitle>
          <CardDescription>Season tracking and closed server settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="season">Season Number</Label>
            <Input
              id="season"
              type="number"
              min={1}
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: parseInt(e.target.value) || 1 })}
            />
            <p className="text-xs text-muted-foreground">
              Track which season this server belongs to
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_closed">Closed Server</Label>
              <p className="text-sm text-muted-foreground">
                Mark this server as closed/archived (shows in &quot;Previous Seasons&quot;)
              </p>
            </div>
            <Switch
              id="is_closed"
              checked={formData.is_closed}
              onCheckedChange={(checked) => setFormData({ ...formData, is_closed: checked })}
            />
          </div>

          {formData.is_closed && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="world_download_url">World Download URL</Label>
              <Input
                id="world_download_url"
                type="url"
                value={formData.world_download_url}
                onChange={(e) => setFormData({ ...formData, world_download_url: e.target.value })}
                placeholder="https://archive.org/details/..."
              />
              <p className="text-xs text-muted-foreground">
                Optional: Link to world archive for players to download
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Server visibility settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active Server</Label>
              <p className="text-sm text-muted-foreground">
                Server is visible to users on the public site
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {mode === 'edit' && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              Deactivate Server
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Server' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
