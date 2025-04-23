import HomeHero from '@/components/home/home-hero';
import HomeServerPreview from '@/components/home/home-server-preview';
import RoadmapTimeline from '@/components/roadmap/roadmap-timeline';

export default function Home() {
	return (
		<div>
			<HomeHero />
			<HomeServerPreview />
			<RoadmapTimeline />
		</div>
	);
}
