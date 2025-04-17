'use client';

import IconButton from '@/components/ui/icon-button';
import { Bell, Moon } from 'lucide-react';

export default function NavIcons() {
	function handleTheme() {
		console.log('Toggle theme');
	}

	function handleNotifications() {
		console.log('Show notifications');
	}

	return (
		<div className="flex gap-2">
			<IconButton
				icon={<Bell size={16} />}
				onClick={handleNotifications}
				ariaLabel="Notifications"
			/>
			<IconButton
				icon={<Moon size={16} />}
				onClick={handleTheme}
				ariaLabel="Toggle theme"
			/>
		</div>
	);
}
