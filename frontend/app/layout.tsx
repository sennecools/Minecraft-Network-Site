import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import '../styles/globals.css';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white transition-colors">
				<Navbar />
				{children}
				<Footer />
			</body>
		</html>
	);
}
