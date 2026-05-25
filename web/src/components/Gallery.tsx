import { useState, useCallback } from 'react'
import { usePhotos, usePhotoSearch, useDeletePhoto, useUpdatePhoto } from '../api/photos'
import type { Photo, Tag } from '../api/photos'
import { Lightbox } from './Lightbox'
import { EditModal } from './EditModal'

function photoUrl(path: string) {
  return `/${path}`
}

interface GalleryProps {
  isAdmin?: boolean
}

export default function Gallery({ isAdmin = false }: GalleryProps) {
  const [query, setQuery] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const { data: allPhotos, isLoading: loadingAll } = usePhotos()
  const { data: searchResult, isLoading: loadingSearch } = usePhotoSearch(query)
  const deletePhoto = useDeletePhoto()
  const updatePhoto = useUpdatePhoto()

  const photos = query ? searchResult?.photos : allPhotos
  const isLoading = query ? loadingSearch : loadingAll

  const handlePhotoClick = useCallback((photo: Photo) => {
    setSelectedPhoto(photo)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setSelectedPhoto(null)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditingPhoto(null)
  }, [])

  const handleEdit = useCallback((photo: Photo) => {
    setSelectedPhoto(null)
    setEditingPhoto(photo)
  }, [])

  const handleDelete = useCallback((id: string) => {
    deletePhoto.mutate(id, {
      onSuccess: () => {
        setSelectedPhoto(null)
      },
    })
  }, [deletePhoto])

  const handleSave = useCallback((photo: Photo) => {
    updatePhoto.mutate(photo, {
      onSuccess: () => {
        setEditingPhoto(null)
      },
    })
  }, [updatePhoto])

  return (
    <div style={{ padding: 0, margin: 0 }}>
      {/* Search bar */}
      <div
        style={{
          marginBottom: 'var(--spacing-4)',
          paddingLeft: 'var(--photo-grid-padding-x)',
          paddingRight: 'var(--photo-grid-padding-x)',
          paddingTop: 'var(--spacing-4)',
        }}
      >
        <input
          type="text"
          placeholder="Search photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md border border-white/5 bg-black-surface text-sm text-white/90 shadow-(--shadow-neu-black-inset) placeholder:text-white/30 focus:border-white/10 focus:outline-none focus:shadow-(--shadow-neu-black-active)"
          style={{
            paddingLeft: 'var(--spacing-4)',
            paddingRight: 'var(--spacing-4)',
            paddingTop: 'var(--spacing-3)',
            paddingBottom: 'var(--spacing-3)',
            borderRadius: 'var(--radius-xs)',
          }}
        />
      </div>

      {isLoading && (
        <div className="py-20 text-center text-sm text-white/40">Loading...</div>
      )}

      {photos && photos.length > 0 && (
        <div
          className="grid flex-1"
          style={{
            gridTemplateColumns: 'repeat(var(--photo-grid-columns), 1fr)',
            gridAutoRows: 'calc((100vw - (var(--photo-grid-padding-x) * 2) - (var(--photo-grid-gap) * (var(--photo-grid-columns) - 1))) / var(--photo-grid-columns) / (16/9))',
            gap: 'var(--photo-grid-gap)',
            paddingTop: 'var(--photo-grid-padding-top)',
            paddingLeft: 'var(--photo-grid-padding-x)',
            paddingRight: 'var(--photo-grid-padding-x)',
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative h-full w-full cursor-pointer overflow-hidden rounded-(--photo-card-radius)"
              style={{
                boxShadow: 'var(--shadow-neu-black-inset)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-neu-black-active)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-neu-black-inset)'
              }}
              onClick={() => handlePhotoClick(photo)}
            >
              <img
                src={photoUrl(photo.thumbnail_path || photo.path)}
                alt={photo.caption}
                loading="lazy"
                className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-medium text-white/90">{photo.caption}</p>
                {photo.description && (
                  <p className="mt-1 text-xs text-white/70">{photo.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
                  {photo.camera && <span>{photo.camera}</span>}
                  {photo.lens && <span>{photo.lens}</span>}
                  {photo.aperture && <span>{photo.aperture}</span>}
                  {photo.shutter_speed && <span>{photo.shutter_speed}</span>}
                  {photo.iso && <span>ISO {photo.iso}</span>}
                </div>
                {photo.tags && photo.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {photo.tags.map((tag: Tag) => (
                      <span
                        key={tag.id}
                        className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {photos && photos.length === 0 && (
        <div className="py-20 text-center text-sm text-white/40">
          No photos found
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={handleCloseLightbox}
          onDelete={isAdmin ? handleDelete : undefined}
          onEdit={isAdmin ? handleEdit : undefined}
          isAdmin={isAdmin}
        />
      )}

      {/* Edit Modal - Admin only */}
      {isAdmin && editingPhoto && (
        <EditModal
          photo={editingPhoto}
          onClose={handleCloseEdit}
          onSave={handleSave}
          isSaving={updatePhoto.isPending}
        />
      )}
    </div>
  )
}
