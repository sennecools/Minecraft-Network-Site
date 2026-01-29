'use client';

import { MessageCircle, Users, Gamepad2 } from 'lucide-react';

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function CommunitySection() {
  const features = [
    {
      icon: MessageCircle,
      title: 'Active Chat',
      description: 'Connect with other players and get help from our community',
    },
    {
      icon: Users,
      title: '1,000+ Members',
      description: 'Join a thriving community of modded Minecraft enthusiasts',
    },
    {
      icon: Gamepad2,
      title: 'Server Updates',
      description: 'Get notified about server updates, events, and announcements',
    },
  ];

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#5865F2]/30 bg-gradient-to-br from-[#5865F2]/10 via-zinc-900 to-zinc-900 p-8 md:p-12">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5865F2]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Discord logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5865F2] mb-6 shadow-lg shadow-[#5865F2]/25">
              <DiscordIcon className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Discord Community
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
              Connect with fellow players, get support, and stay updated on all things Sen&apos;s Network
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-zinc-800/30 border border-zinc-700/30 text-center hover:border-[#5865F2]/30 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800/50 mb-3">
                    <feature.icon className="w-6 h-6 text-[#5865F2]" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <a
              href="https://discord.gg/ZNa56yhz48"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#5865F2]/25"
            >
              <DiscordIcon className="w-6 h-6" />
              Join the Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
