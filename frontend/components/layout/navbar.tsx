'use client';

import { Home, Server, ShoppingCart, MessageCircle } from 'lucide-react';
import NavItem from './nav-item';
import NavIcons from './nav-icon';

export default function Navbar() {
	return (
		<nav className="w-full px-6 py-2 flex items-center gap-2 dark:bg-zinc-900 bg-opacity-50 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-700">
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
				icon={<ShoppingCart size={16} />}
				title="Shop"
				href="https://patreon.com/c/SenNerd"
				openNewTab
			/>
			<NavItem
				icon={<MessageCircle size={16} />}
				title="Discord"
				href="https://discord.gg/ZNa56yhz48"
				openNewTab
			/>
			<div className="ml-auto flex gap-2">
				<NavIcons />
			</div>
		</nav>
	);
}
