'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function PatreonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524zM.003 23.537h4.22V.524H.003z"/>
    </svg>
  );
}

interface Server {
  id: string;
  name: string;
  ip: string;
}

export default function Footer() {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await fetch('/api/servers');
        if (res.ok) {
          const data = await res.json();
          setServers(data);
        }
      } catch (error) {
        console.error('Failed to fetch servers:', error);
      }
    }
    fetchServers();
  }, []);

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <h3 className="font-bold text-xl text-white mb-3">Sen&apos;s Network</h3>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              A cozy corner of the Minecraft universe. Custom modpacks, friendly community, zero drama.
            </p>
            <div className="flex gap-3">
              <a
                href="https://discord.gg/ZNa56yhz48"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-[#5865F2] hover:border-[#5865F2]/50 transition-colors"
                aria-label="Discord"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a
                href="https://patreon.com/c/SenNerd"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:text-[#FF424D] hover:border-[#FF424D]/50 transition-colors"
                aria-label="Patreon"
              >
                <PatreonIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/servers" className="text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                  Servers
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-zinc-400 hover:text-emerald-400 text-sm transition-colors">
                  News
                </Link>
              </li>
              <li>
                <a
                  href="https://patreon.com/c/SenNerd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-emerald-400 text-sm transition-colors"
                >
                  Support Us
                </a>
              </li>
            </ul>
          </div>

          {/* Servers */}
          <div>
            <h4 className="font-semibold text-white mb-4">Servers</h4>
            <ul className="space-y-2.5">
              {servers.length > 0 ? (
                servers.map(server => (
                  <li key={server.id}>
                    <Link
                      href={`/servers/${server.id}`}
                      className="text-zinc-400 hover:text-emerald-400 text-sm transition-colors"
                    >
                      {server.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500 text-sm">Loading servers...</li>
              )}
            </ul>
          </div>

          {/* Server IPs */}
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="space-y-3">
              {servers.length > 0 ? (
                servers.map(server => (
                  <div key={server.id} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                    <div className="text-xs text-zinc-500 mb-1">{server.name}</div>
                    <code className="text-sm text-emerald-400 font-mono">{server.ip}</code>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 text-sm">Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Sen&apos;s Network. All rights reserved.
          </p>
          <p className="text-zinc-600 text-sm flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by Sen
          </p>
        </div>
      </div>
    </footer>
  );
}
