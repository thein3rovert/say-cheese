import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Photo } from './types'

export type { Photo } from './types'
export type { Tag } from './types'

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

async function uploadPhoto(file: File): Promise<Photo> {
  const formData = new FormData()
  formData.append('photo', file)

  const res = await fetch(`${API_BASE}/api/photos/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Failed to upload photo')
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

async function deletePhoto(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/photos/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete photo')
}

async function updatePhoto(photo: Photo): Promise<Photo> {
  const res = await fetch(`${API_BASE}/api/photos/${photo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo),
  })
  if (!res.ok) throw new Error('Failed to update photo')
  return res.json()
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}

export function useUpdatePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}
