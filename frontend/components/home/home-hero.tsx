import Link from 'next/link';

export default function HomeHero() {
	return (
		<div className="text-center py-20 px-4">
			<h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4">
				Sen&apos;s Network
			</h1>
			<p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
				A community-driven Minecraft network for modded exploration and
				creativity.
			</p>

			<div className="mt-6 flex justify-center gap-4">
				<Link
					href="https://discord.gg/ZNa56yhz48"
					className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-medium transition"
					target="_blank"
				>
					Join Discord
				</Link>
				<Link
					href="https://patreon.com/c/SenNerd"
					className="bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white px-5 py-2 rounded-md text-sm font-medium transition"
					target="_blank"
				>
					Support on Patreon
				</Link>
			</div>
		</div>
	);
}
