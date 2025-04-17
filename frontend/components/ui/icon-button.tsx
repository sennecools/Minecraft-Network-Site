'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type IconButtonProps = {
	icon: ReactNode;
	onClick?: () => void;
	className?: string;
	ariaLabel?: string;
};

export default function IconButton({
	icon,
	onClick,
	className,
	ariaLabel = '',
}: IconButtonProps) {
	return (
		<button
			onClick={onClick}
			aria-label={ariaLabel}
			className={cn(
				'p-2 rounded-md shadow-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition',
				className
			)}
		>
			{icon}
		</button>
	);
}
