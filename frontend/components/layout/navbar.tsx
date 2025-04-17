'use client';

import { Home, Server, Heart, MessageCircle } from 'lucide-react';
import NavItem from './nav-item';
import NavIcons from './nav-icon';

export default function Navbar() {
	return (
		<nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-2 flex items-center gap-2 shadow-sm">
			<NavItem
				icon={<Home size={16} />}
				title="Home"
				href="/"
			/>
			<NavItem
				icon={<Server size={16} />}
				title="Servers"
				href="/servers"
			/>
			<NavItem
				icon={<Heart size={16} />}
				title="Shop"
				href="https://patreon.com/yourpage"
			/>
			<NavItem
				icon={<MessageCircle size={16} />}
				title="Discord"
				href="https://discord.gg/yourserver"
			/>

			{/* Icon-only actions (right side) */}
			<div className="ml-auto flex gap-2">
				<NavIcons />
			</div>
		</nav>
	);
}
