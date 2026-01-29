'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function CrossGrid() {
  // Create a grid of crosses that animate in a wave
  const cols = 40;
  const rows = 20;
  const spacing = 60;

  return (
    <div className="absolute inset-0">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          // Calculate delay based on distance from top-left
          const delay = (row + col) * 0.12;

          return (
            <motion.div
              key={`${row}-${col}`}
              className="absolute w-2.5 h-2.5"
              style={{
                left: col * spacing + 6,
                top: row * spacing + 6,
                opacity: 0.035,
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.035, 0.07, 0.035],
              }}
              transition={{
                duration: 3,
                delay: delay % 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Cross shape */}
              <svg viewBox="0 0 12 12" fill="white">
                <path d="M5 0v5H0v2h5v5h2V7h5V5H7V0H5z" />
              </svg>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950" />

      {/* Animated cross grid pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <CrossGrid />
      </div>

      {/* Subtle glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1.5 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Modded Minecraft Community
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
          >
            Sen&apos;s Network
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Custom modded servers, awesome community.
            <span className="text-zinc-300"> No corporate BS, just good vibes and great gameplay.</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="https://discord.gg/ZNa56yhz48"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3.5 rounded-xl text-base font-medium transition-all duration-150 shadow-lg shadow-[#5865F2]/25 hover:-translate-y-0.5 active:scale-95"
            >
              <DiscordIcon className="w-5 h-5" />
              Join the Discord
            </a>

            <Link
              href="/servers"
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-6 py-3.5 rounded-xl text-base font-medium transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
            >
              Browse Servers
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-zinc-600 flex justify-center pt-2">
          <div className="w-1 h-2 bg-zinc-500 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
