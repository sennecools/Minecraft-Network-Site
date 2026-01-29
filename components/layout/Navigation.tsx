'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Server, Newspaper, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/servers', label: 'Servers', icon: Server },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/store', label: 'Patreon', icon: ShoppingCart, external: 'https://patreon.com/c/SenNerd' },
];

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function NavItem({ href, label, icon: Icon, external, isActive }: {
  href: string;
  label: string;
  icon: any;
  external?: string;
  isActive: boolean;
}) {
  const classes = cn(
    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition',
    isActive
      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white'
      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
  );

  if (external) {
    return (
      <a href={external} target="_blank" rel="noopener noreferrer" className={classes}>
        <Icon size={16} />
        <span className="hidden sm:inline">{label}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navigation on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full px-4 md:px-6 py-2 flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      {/* Logo */}
      <Link
        href="/"
        className="font-bold text-lg text-zinc-900 dark:text-white mr-4"
      >
        Sen&apos;s
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <NavItem
            key={link.href}
            {...link}
            isActive={pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))}
          />
        ))}
      </div>

      {/* Right side icons */}
      <div className="ml-auto flex items-center gap-2">
        {/* Discord button */}
        <a
          href="https://discord.gg/ZNa56yhz48"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
        >
          <DiscordIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Discord</span>
        </a>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));

              if (link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Icon size={18} />
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg',
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
