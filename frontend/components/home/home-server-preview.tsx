'use client';

import ServerCard from '@/components/server/server-card';

const mockServers = [
	{
		name: 'All the Mods 10',
		modpack: 'ATM10',
		description: 'Endless tech, magic, and chaos.',
		playerCount: 4,
		isPopular: true,
		imageUrl: '/modpacks/atm10.png',
	},
	{
		name: 'MoniFactory',
		modpack: 'MoniFactory v1.3',
		description: 'Factory-focused modpack with tight progression.',
		playerCount: 0,
		isClosed: true,
		imageUrl: '/modpacks/monifactory.png',
	},
];

export default function HomeServerPreview() {
	return (
		<section className="px-4 max-w-5xl mx-auto mt-16">
			<h2 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">
				Active Servers
			</h2>

			<div className="grid sm:grid-cols-2 gap-6">
				{mockServers.map((server, idx) => (
					<ServerCard
						key={idx}
						{...server}
					/>
				))}
			</div>

			<div className="mt-10 text-center">
				<a
					href="/servers"
					className="text-sm text-indigo-600 hover:underline"
				>
					View all servers →
				</a>
			</div>
		</section>
	);
}
