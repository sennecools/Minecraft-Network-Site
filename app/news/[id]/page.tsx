'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Calendar, Megaphone, Wrench, Info, Pin, User, Clock } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  type: 'update' | 'maintenance' | 'news' | 'event';
  is_pinned: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  server_id: string | null;
}

const typeConfig = {
  update: { label: 'Update', icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  news: { label: 'News', icon: Info, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  event: { label: 'Event', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function SkeletonPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <section className="py-8 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="h-10 w-32 bg-zinc-800 rounded-lg mb-6 animate-pulse" />
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-20 bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-zinc-800 rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-full bg-zinc-800 rounded mb-4 animate-pulse" />
          <div className="h-6 w-64 bg-zinc-800 rounded animate-pulse" />
        </div>
      </section>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-4">
            <div className="h-6 w-full bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-full bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-full bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function NewsDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const res = await fetch(`/api/announcements/${resolvedParams.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setNotFoundError(true);
          }
          return;
        }
        const data = await res.json();
        setAnnouncement(data);
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncement();
  }, [resolvedParams.id]);

  if (notFoundError) {
    notFound();
  }

  if (loading) {
    return <SkeletonPage />;
  }

  if (!announcement) {
    return null;
  }

  const config = typeConfig[announcement.type] || typeConfig.news;
  const Icon = config.icon;

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="py-8 md:py-12 border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to News
          </Link>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color} ${config.border} border`}>
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </span>
            {announcement.is_pinned && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                <Pin className="h-3.5 w-3.5" />
                Pinned
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {announcement.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {announcement.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(announcement.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatTime(announcement.published_at)}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-2xl border bg-zinc-900/50 border-zinc-800 p-6 md:p-8">
            <div className="prose prose-invert max-w-none">
              {/* Render content as paragraphs */}
              {announcement.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-zinc-300 leading-relaxed mb-4 last:mb-0">
                  {paragraph.split('\n').map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {line}
                      {lineIndex < paragraph.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>

          {/* Updated notice */}
          {announcement.updated_at !== announcement.created_at && (
            <p className="text-sm text-zinc-500 mt-6 text-center">
              Last updated: {formatDate(announcement.updated_at)}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-10 pt-8 border-t border-zinc-800">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to all announcements
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
