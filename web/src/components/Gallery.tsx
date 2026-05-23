import { useState, useCallback, useEffect } from 'react'
import { usePhotos, usePhotoSearch } from '../api/photos'
import type { Photo, Tag } from '../api/photos'

function photoUrl(path: string) {
  return `/${path}`
}

interface LightboxProps {
  photo: Photo
  onClose: () => void
}

function Lightbox({ photo, onClose }: LightboxProps) {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-base/95 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden bg-black-surface"
        style={{
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-neu-black-inset)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black-base/80 p-2 text-white/60 transition-colors hover:text-white/90"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <img
          src={photoUrl(photo.path)}
          alt={photo.caption}
          className="max-h-[80vh] max-w-[90vw] object-contain"
        />

        {/* Caption overlay at bottom */}
        {(photo.caption || (photo.tags && photo.tags.length > 0)) && (
          <div
            className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent"
            style={{ padding: 'var(--spacing-6)' }}
          >
            {photo.caption && (
              <p className="text-base font-medium text-white/90">{photo.caption}</p>
            )}
            {photo.tags && photo.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photo.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs text-white/70"
                    style={{
                      paddingLeft: 'var(--spacing-2)',
                      paddingRight: 'var(--spacing-2)',
                      paddingTop: 'var(--spacing-1)',
                      paddingBottom: 'var(--spacing-1)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Gallery() {
  const [query, setQuery] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const { data: allPhotos, isLoading: loadingAll } = usePhotos()
  const { data: searchResult, isLoading: loadingSearch } = usePhotoSearch(query)

  const photos = query ? searchResult?.photos : allPhotos
  const isLoading = query ? loadingSearch : loadingAll

  const handlePhotoClick = useCallback((photo: Photo) => {
    setSelectedPhoto(photo)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setSelectedPhoto(null)
  }, [])

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
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: 'calc((100vw - (var(--photo-grid-padding-x) * 2) - (var(--photo-grid-gap) * 2)) / 3 / (16/9))',
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
                src={photoUrl(photo.path)}
                alt={photo.caption}
                loading="lazy"
                className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-medium text-white/90">{photo.caption}</p>
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
        <Lightbox photo={selectedPhoto} onClose={handleCloseLightbox} />
      )}
    </div>
  )
}
