'use client';

import useSWR from 'swr';
import { ServerStatus } from './types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useServerStatus(serverId: string) {
  const { data, error, isLoading } = useSWR<ServerStatus>(
    `/api/server-status?id=${serverId}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: false,
    }
  );

  return {
    status: data,
    isLoading,
    isError: error,
  };
}
