'use client';

import PatreonTierCard from '@/components/PatreonTierCard';
import { PatreonTier } from '@/lib/types';
import { useRef } from 'react';
import { Heart, Server, Zap, PartyPopper } from 'lucide-react';

export default function StorePage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const tiers: PatreonTier[] = [
    {
      id: 'supporter',
      name: 'Supporter',
      price: 5,
      currency: '$',
      patreonUrl: 'https://patreon.com/your-page',
      benefits: [
        'Supporter role in Discord',
        'Access to supporter-only chat',
        'Vote on server decisions',
        'Thank you in server credits',
      ],
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 10,
      currency: '$',
      patreonUrl: 'https://patreon.com/your-page',
      popular: true,
      benefits: [
        'All Supporter benefits',
        'VIP role and chat color',
        '/sethome with 3 homes',
        'Access to VIP lounge',
        'Priority support',
      ],
    },
    {
      id: 'mvp',
      name: 'MVP',
      price: 15,
      currency: '$',
      patreonUrl: 'https://patreon.com/your-page',
      benefits: [
        'All VIP benefits',
        'MVP role and custom prefix',
        '/sethome with 5 homes',
        'Access to exclusive items',
        'Custom Discord role color',
      ],
    },
    {
      id: 'legend',
      name: 'Legend',
      price: 25,
      currency: '$',
      patreonUrl: 'https://patreon.com/your-page',
      benefits: [
        'All MVP benefits',
        'Legend role and animated prefix',
        '/sethome with 10 homes',
        'Early access to new features',
        'Exclusive cosmetics',
        'Priority queue',
      ],
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 50,
      currency: '$',
      patreonUrl: 'https://patreon.com/your-page',
      benefits: [
        'All Legend benefits',
        'Ultimate role with particle effects',
        'Unlimited /sethome',
        'Personal warp point',
        'Custom item name colors',
        'Monthly exclusive kit',
      ],
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 100,
      currency: '$',
      patreonUrl: 'https://patreon.com/your-page',
      benefits: [
        'All Ultimate benefits',
        'Elite role with special effects',
        'Custom commands access',
        'Exclusive server events',
        'Direct line to server owner',
        'Lifetime VIP access',
        'Your name in spawn hall of fame',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
            <Heart className="w-4 h-4" />
            <span>Support the Network</span>
          </div>

          <h1 className="text-6xl font-black mb-4 drop-shadow-lg">Support Sen&apos;s Network</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
            Help keep the servers running and get some cool perks.
            <br />
            <span className="text-white/75">All managed through Patreon - no sketchy payment processors.</span>
          </p>

          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-white/30">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
            </svg>
            <span className="font-bold text-lg">Powered by Patreon</span>
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Tiers */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-4">
              Choose Your Tier
            </h2>
            <p className="text-gray-600 font-medium">Scroll to see all tiers</p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Scroll buttons */}
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-full p-3 shadow-xl transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-100 border-2 border-gray-300 rounded-full p-3 shadow-xl transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tiers.map((tier) => (
                <div key={tier.id} className="flex-shrink-0 w-80 snap-center">
                  <PatreonTierCard tier={tier} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black text-gray-900 mb-6">Where Does the Money Go?</h2>
            <p className="text-lg text-gray-700 mb-12 font-medium">
              100% transparency - every dollar goes back into the servers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Server className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-black text-gray-900 mb-2 text-lg">Server Costs</h3>
                <p className="text-gray-600 text-sm font-medium">
                  Powerful hosting so you don&apos;t lag
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl border-2 border-cyan-200">
                <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-cyan-600" />
                </div>
                <h3 className="font-black text-gray-900 mb-2 text-lg">Development</h3>
                <p className="text-gray-600 text-sm font-medium">
                  Custom mods and new features
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border-2 border-teal-200">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-black text-gray-900 mb-2 text-lg">Community</h3>
                <p className="text-gray-600 text-sm font-medium">
                  Events, prizes, and giveaways
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
