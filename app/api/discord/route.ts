import { NextResponse } from 'next/server';

// Your Discord server ID - extract from invite link or server settings
const DISCORD_SERVER_ID = '1234567890'; // Replace with actual server ID

export async function GET() {
  try {
    // Try to fetch from Discord widget API (server must have widget enabled)
    const res = await fetch(
      `https://discord.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        memberCount: data.presence_count || 0, // Online members
        name: data.name,
      });
    }

    // Fallback to a static/estimated count if widget not enabled
    return NextResponse.json({
      memberCount: 1000, // Fallback estimate
      name: "Sen's Network",
    });
  } catch (error) {
    console.error('Discord API error:', error);
    return NextResponse.json({
      memberCount: 1000, // Fallback
      name: "Sen's Network",
    });
  }
}
