'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, Megaphone, Wrench, Info, Pin, ChevronRight, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  type: 'update' | 'maintenance' | 'news' | 'event';
  is_pinned: boolean;
  published_at: string;
  server_id: string | null;
}

interface PaginatedResponse {
  announcements: Announcement[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const typeConfig = {
  update: { label: 'Update', icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  news: { label: 'News', icon: Info, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  event: { label: 'Event', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

const typeFilters = [
  { value: '', label: 'All' },
  { value: 'update', label: 'Updates' },
  { value: 'news', label: 'News' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'event', label: 'Events' },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncateContent(content: string, maxLength: number = 200) {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + '...';
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-zinc-900/50 border-zinc-800 p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-20 bg-zinc-800 rounded-full" />
        <div className="h-6 w-16 bg-zinc-800 rounded-full" />
      </div>
      <div className="h-7 w-3/4 bg-zinc-800 rounded mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-2/3 bg-zinc-800 rounded" />
      </div>
      <div className="h-4 w-32 bg-zinc-800 rounded" />
    </div>
  );
}

export default function NewsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 10;

  async function fetchAnnouncements(reset: boolean = false) {
    const currentOffset = reset ? 0 : offset;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
      });
      if (typeFilter) {
        params.set('type', typeFilter);
      }

      const res = await fetch(`/api/announcements?${params}`);
      if (res.ok) {
        const data: PaginatedResponse = await res.json();

        if (reset) {
          setAnnouncements(data.announcements);
        } else {
          setAnnouncements(prev => [...prev, ...data.announcements]);
        }

        setHasMore(data.pagination.hasMore);
        setOffset(currentOffset + limit);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setOffset(0);
    fetchAnnouncements(true);
  }, [typeFilter]);

  const loadMore = () => {
    fetchAnnouncements(false);
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="py-16 md:py-20 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            News & Announcements
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            Stay up to date with the latest server updates, events, and community announcements.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-zinc-800 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  typeFilter === filter.value
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements list */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-2xl border bg-zinc-900/50 border-zinc-800 py-16 text-center">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No announcements</h3>
              <p className="text-zinc-400">
                {typeFilter
                  ? `No ${typeFilter} announcements found.`
                  : 'Check back later for news and updates.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {announcements.map((announcement) => {
                  const config = typeConfig[announcement.type] || typeConfig.news;
                  const Icon = config.icon;

                  return (
                    <Link key={announcement.id} href={`/news/${announcement.id}`} className="group block">
                      <div className="rounded-xl border bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                        {/* Header row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} ${config.border} border`}>
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </span>
                            {announcement.is_pinned && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-zinc-500">
                            {formatDate(announcement.published_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors mb-3">
                          {announcement.title}
                        </h2>

                        {/* Content preview */}
                        <p className="text-zinc-400 line-clamp-3 mb-4">
                          {truncateContent(announcement.content)}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-500">
                            By {announcement.author}
                          </span>
                          <span className="text-sm text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Read more
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium transition-all disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
