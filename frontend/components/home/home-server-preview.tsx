'use client';

const mockServers = [
	{
		name: 'All the Mods 10',
		modpack: 'ATM10',
		description: 'Endless tech, magic, and chaos.',
		playerCount: 4,
	},
	{
		name: 'MoniFactory',
		modpack: 'MoniFactory v1.3',
		description: 'Factory-focused modpack with tight progression.',
		playerCount: 2,
	},
];

export default function HomeServerPreview() {
	return (
		<section className="px-4 max-w-4xl mx-auto mt-10">
			<h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">
				Active Servers
			</h2>

			<div className="grid sm:grid-cols-2 gap-4">
				{mockServers.map((server, idx) => (
					<div
						key={idx}
						className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 shadow-sm flex flex-col gap-1"
					>
						<h3 className="text-lg font-semibold">{server.name}</h3>
						<p className="text-sm text-zinc-400">
							{server.modpack}
						</p>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							{server.description}
						</p>
						<p className="text-sm text-green-600 mt-1">
							{server.playerCount} players online
						</p>
					</div>
				))}
			</div>

			<div className="mt-6 text-center">
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
