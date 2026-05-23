import { useQuery } from '@tanstack/react-query'
import type { Photo } from './types'

const API_BASE = '' // proxied via vite

async function fetchPhotos(): Promise<Photo[]> {
  const res = await fetch(`${API_BASE}/api/photos`)
  if (!res.ok) throw new Error('Failed to fetch photos')
  return res.json()
}

async function searchPhotos(query: string): Promise<{ photos: Photo[]; search_query: string }> {
  const res = await fetch(`${API_BASE}/api/photos/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Failed to search photos')
  return res.json()
}

export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
  })
}

export function usePhotoSearch(query: string) {
  return useQuery({
    queryKey: ['photos', 'search', query],
    queryFn: () => searchPhotos(query),
    enabled: query.length > 0,
  })
}
