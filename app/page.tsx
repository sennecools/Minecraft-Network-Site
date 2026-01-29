import HeroSection from '@/components/home/HeroSection';
import StatsStrip from '@/components/home/StatsStrip';
import FeaturedServers from '@/components/home/FeaturedServers';
import LatestNews from '@/components/home/LatestNews';
import CommunitySection from '@/components/home/CommunitySection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsStrip />
      <FeaturedServers />
      <LatestNews />
      <CommunitySection />
    </main>
  );
}
