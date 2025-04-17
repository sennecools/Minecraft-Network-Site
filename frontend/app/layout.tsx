import Navbar from '@/components/layout/navbar';
import '../styles/globals.css';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
				<Navbar />
				{children}
			</body>
		</html>
	);
}
