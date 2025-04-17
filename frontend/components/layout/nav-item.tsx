import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { ReactNode } from 'react';

type NavItemProps = {
	icon: ReactNode;
	title: string;
	href: string;
	openNewTab?: boolean;
};

export default function NavItem({
	icon,
	title,
	href,
	openNewTab = false,
}: NavItemProps) {
	const pathname = usePathname();
	const isActive = pathname === href;

	const commonClasses = clsx(
		'flex items-center gap-2 px-2 py-1 rounded-lg text-sm font-medium transition bg-zinc-700',
		isActive
			? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
			: 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
	);

	if (openNewTab) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={commonClasses}
			>
				{icon}
				<span>{title}</span>
			</a>
		);
	}

	return (
		<Link
			href={href}
			className={commonClasses}
		>
			{icon}
			<span>{title}</span>
		</Link>
	);
}
