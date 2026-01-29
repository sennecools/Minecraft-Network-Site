'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Megaphone, Wrench, Info, Pin } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'update' | 'maintenance' | 'news' | 'event';
  is_pinned: boolean;
  published_at: string;
  server_name?: string;
}

const typeConfig = {
  update: { label: 'Update', icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  news: { label: 'News', icon: Info, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  event: { label: 'Event', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncateContent(content: string, maxLength: number = 150) {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + '...';
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-zinc-900/50 border-zinc-800 p-5 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-zinc-800 rounded-full" />
      </div>
      <div className="h-6 w-full bg-zinc-800 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}

export default function LatestNews() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements?limit=3');
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  // Don't render section if no announcements
  if (!loading && announcements.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-zinc-900">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Latest News
            </h2>
            <p className="text-zinc-400 max-w-lg">
              Stay up to date with server updates and announcements
            </p>
          </div>
          <Link
            href="/news"
            className="hidden sm:flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
          >
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Announcements grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((announcement) => {
              const config = typeConfig[announcement.type] || typeConfig.news;
              const Icon = config.icon;

              return (
                <Link key={announcement.id} href={`/news/${announcement.id}`} className="group block">
                  <div className="h-full rounded-xl border bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} ${config.border} border`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>
                      {announcement.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors mb-3 line-clamp-2">
                      {announcement.title}
                    </h3>

                    {/* Content preview */}
                    <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                      {truncateContent(announcement.content)}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        {formatDate(announcement.published_at)}
                      </span>
                      {announcement.server_name && (
                        <span className="px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                          {announcement.server_name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white transition-colors"
          >
            View All News
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
