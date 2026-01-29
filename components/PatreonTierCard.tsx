import { PatreonTier } from '@/lib/types';

interface PatreonTierCardProps {
  tier: PatreonTier;
}

export default function PatreonTierCard({ tier }: PatreonTierCardProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl border-2 ${
        tier.popular ? 'border-cyan-400 shadow-2xl' : 'border-gray-200 shadow-lg'
      } overflow-hidden transition-all hover:shadow-2xl hover:border-cyan-400 h-full flex flex-col`}
    >
      {tier.popular && (
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white text-center py-2.5 text-sm font-black">
          ⭐ MOST POPULAR ⭐
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-3xl font-black text-gray-900 mb-4">{tier.name}</h3>

        <div className="mb-6">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
            {tier.currency}
            {tier.price}
          </span>
          <span className="text-gray-600 font-bold">/mo</span>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {tier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mt-0.5">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-gray-700 font-medium">{benefit}</span>
            </li>
          ))}
        </ul>

        <a
          href={tier.patreonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center py-4 px-6 rounded-2xl font-black transition-all transform hover:scale-105 ${
            tier.popular
              ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white shadow-lg'
              : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white'
          }`}
        >
          Subscribe on Patreon →
        </a>
      </div>
    </div>
  );
}
