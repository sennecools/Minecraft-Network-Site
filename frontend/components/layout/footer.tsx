import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16 py-6 px-4">
			<div className="max-w-4xl mx-auto flex flex-col items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
				<div className="flex justify-center items-center gap-4">
					<Link
						href="https://github.com/sennecools"
						target="_blank"
						aria-label="GitHub"
						title="GitHub Profile"
						className="hover:text-zinc-900 dark:hover:text-white transition transform hover:scale-110"
					>
						<svg
							width="20"
							height="20"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577v-2.234c-3.338.724-4.033-1.416-4.033-1.416-.546-1.388-1.333-1.758-1.333-1.758-1.09-.745.083-.729.083-.729 1.205.086 1.838 1.238 1.838 1.238 1.07 1.832 2.807 1.303 3.492.996.108-.775.42-1.303.762-1.602-2.665-.305-5.467-1.334-5.467-5.932 0-1.31.468-2.382 1.236-3.222-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.49 11.49 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.292-1.552 3.297-1.23 3.297-1.23.654 1.652.243 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.807 5.624-5.48 5.92.43.372.814 1.102.814 2.222v3.293c0 .319.192.694.8.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
						</svg>
					</Link>

					<Link
						href="https://www.linkedin.com/in/senne-cools/"
						target="_blank"
						aria-label="LinkedIn"
						title="LinkedIn Profile"
						className="hover:text-zinc-900 dark:hover:text-white transition transform hover:scale-110"
					>
						<svg
							width="20"
							height="20"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M4.983 3.5C4.983 4.604 4.101 5.5 3 5.5S1 4.604 1 3.5 1.898 1.5 3 1.5s1.983.896 1.983 2zm.017 4.5H1V22h4V8zm7.982 0H9v14h4v-7.186c0-4.035 5-4.362 5 0V22h4v-8.294c0-7.275-8-7.003-10-3.417V8z" />
						</svg>
					</Link>
				</div>

				<p>
					© {new Date().getFullYear()} Senne Cools Network — All
					rights reserved.
				</p>
			</div>
		</footer>
	);
}
