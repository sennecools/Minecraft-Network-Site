import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

type NavItemProps = {
	icon: React.ReactNode;
	title: string;
	href: string;
};

export default function NavItem({ icon, title, href }: NavItemProps) {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Link
			href={href}
			className={clsx(
				'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
				isActive
					? 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
					: 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
			)}
		>
			{icon}
			<span>{title}</span>
		</Link>
	);
}
