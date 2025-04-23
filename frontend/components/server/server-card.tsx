'use client';

import Link from 'next/link';
import { slugify } from '@/lib/slugify';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ServerCardProps = {
	name: string;
	modpack: string;
	description: string;
	playerCount: number;
	isPopular?: boolean;
	imageUrl?: string;
};

export default function ServerCard({
	name,
	modpack,
	description,
	playerCount,
	isPopular = false,
	imageUrl,
}: ServerCardProps) {
	const slug = slugify(name);
	const [imgError, setImgError] = useState(false);

	return (
		<Link
			href={`/servers/${slug}`}
			className={cn(
				'group relative bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 overflow-hidden transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg flex flex-col gap-2'
			)}
		>
			{isPopular && (
				<span className="absolute top-3 right-3 text-xs font-semibold bg-indigo-600 text-white px-2 py-1 rounded-md shadow-md">
					Popular Server
				</span>
			)}

			{imageUrl && !imgError && (
				<div className="aspect-[4/1] bg-zinc-300 dark:bg-zinc-700 rounded-md overflow-hidden">
					<Image
						src={imageUrl}
						alt={`${name} banner`}
						onError={() => setImgError(true)}
						className="w-full h-full object-cover"
						width={400}
						height={100}
					/>
				</div>
			)}

			{(imgError || !imageUrl) && (
				<div className="aspect-[4/1] flex items-center justify-center text-sm text-zinc-400 bg-zinc-200 dark:bg-zinc-700 rounded-md">
					No image available
				</div>
			)}

			<h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:underline">
				{name}
			</h3>
			<p className="text-sm text-zinc-400">{modpack}</p>
			<p className="text-sm text-zinc-500 dark:text-zinc-400">
				{description}
			</p>
			<p className="text-sm text-green-600 mt-1">
				{playerCount} players online
			</p>
		</Link>
	);
}
