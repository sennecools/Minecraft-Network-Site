export interface Server {
  id: string;
  name: string;
  shortName: string;
  ip: string;
  port: number;
  description: string;
  longDescription?: string;
  features: string[];
  modpackVersion: string;
  minecraftVersion?: string;
}

export interface ServerStatus {
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  version?: string;
  motd?: string;
  latency?: number;
}

export interface PlayerStats {
  username: string;
  uuid: string;
  playtime: number; // in hours
  joinDate: string;
  lastSeen: string;
  rank?: string;
}

export interface Leaderboard {
  serverId: string;
  metric: 'playtime' | 'other';
  players: PlayerStats[];
}

export interface PatreonTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  patreonUrl: string;
  color?: string;
  popular?: boolean;
}
