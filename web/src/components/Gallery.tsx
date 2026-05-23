import { useState } from 'react'
import { usePhotos, usePhotoSearch } from '../api/photos'

function photoUrl(path: string) {
  return `/${path}`
}

export default function Gallery() {
  const [query, setQuery] = useState('')
  const { data: allPhotos, isLoading: loadingAll } = usePhotos()
  const { data: searchResult, isLoading: loadingSearch } = usePhotoSearch(query)

  const photos = query ? searchResult?.photos : allPhotos
  const isLoading = query ? loadingSearch : loadingAll

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
                    {photo.tags.map((tag) => (
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
    </div>
  )
}
