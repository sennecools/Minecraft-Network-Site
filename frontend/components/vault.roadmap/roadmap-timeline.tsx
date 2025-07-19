'use client';

import { useState } from 'react';

const events = [
	{
		date: '2025-02-01',
		title: 'All the Mods 10 Released',
		description: 'Flagship server goes live with 300+ mods.',
		color: '#3b82f6',
		link: '/servers/all-the-mods-10',
	},
	{
		date: '2025-03-12',
		title: 'MoniFactory Launched',
		description: 'Our first custom automation server goes live.',
		color: '#22c55e',
		link: '/servers/monifactory',
	},
];

const TIMELINE_START = new Date('2025-01-01');
const TIMELINE_END = new Date('2026-12-31');
const TIMELINE_RANGE = TIMELINE_END.getTime() - TIMELINE_START.getTime();

function monthsBetween(a: Date, b: Date) {
	return (
		(b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
	);
}

export default function RoadmapTimeline() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<section className="w-full max-w-6xl mx-auto px-4 py-24">
			<h2 className="text-2xl font-bold text-center mb-12 text-zinc-900 dark:text-white">
				Network Roadmap
			</h2>

			{/* Year labels */}
			<div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-600 px-1 mb-2">
				<span>2025</span>
				<span>2026</span>
			</div>

			{/* Timeline bar */}
			<div className="relative h-1 bg-zinc-300 dark:bg-zinc-700 mb-20" />

			{/* Positioned events */}
			<div className="relative w-full h-0">
				{events.map((event, index) => {
					const eventDate = new Date(event.date);
					const timeSinceStart =
						eventDate.getTime() - TIMELINE_START.getTime();
					const percentage = (timeSinceStart / TIMELINE_RANGE) * 100;

					// Check for overlap
					const previous = events[index - 1];
					const overlaps =
						previous &&
						monthsBetween(new Date(previous.date), eventDate) <= 2;

					return (
						<div
							key={index}
							className="absolute flex flex-col items-center"
							style={{
								left: `${percentage}%`,
								transform: 'translateX(-50%)',
							}}
							onMouseEnter={() => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(null)}
						>
							{/* Dot on line */}
							<div
								className="w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 shadow-md z-10 bg-opacity-100"
								style={{
									backgroundColor: event.color,
									top: '-0.5rem',
									position: 'relative',
								}}
								title={event.title}
							/>

							{/* Vertical connector */}
							<div
								className={`w-px ${
									overlaps ? 'h-28' : 'h-16'
								} bg-zinc-400 dark:bg-zinc-600`}
							/>

							{/* Title only, hover to show details */}
							<div className="relative mt-2 text-sm font-medium text-center text-zinc-700 dark:text-zinc-300 cursor-pointer">
								{event.title}
								{hoveredIndex === index && (
									<div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 text-center bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 p-3 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-20">
										<p className="font-semibold mb-1">
											{event.date}
										</p>
										<p>{event.description}</p>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
