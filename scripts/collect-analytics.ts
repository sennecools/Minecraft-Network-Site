/**
 * Local Analytics Collection Script
 * Run this while developing locally to collect analytics data every 5 minutes
 *
 * Usage: npx tsx scripts/collect-analytics.ts
 */

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const API_URL = 'http://localhost:3000/api/analytics/collect';

async function collect() {
  const timestamp = new Date().toLocaleTimeString();
  try {
    const res = await fetch(API_URL, {
      headers: { 'x-vercel-cron': '1' }
    });
    const data = await res.json();
    if (data.success) {
      console.log(`[${timestamp}] Collected ${data.collected} server(s):`,
        data.results.map((r: any) => `${r.server_id}: ${r.status}`).join(', '));
    } else {
      console.error(`[${timestamp}] Collection failed:`, data.error);
    }
  } catch (error) {
    console.error(`[${timestamp}] Error:`, error instanceof Error ? error.message : error);
  }
}

console.log('Starting local analytics collection (every 5 minutes)...');
console.log('Press Ctrl+C to stop.\n');

// Collect immediately, then every 5 minutes
collect();
setInterval(collect, INTERVAL_MS);
