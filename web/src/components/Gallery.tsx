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
    <div className="px-[3px] pb-[3px]">
      {/* Search bar */}
      <div className="mb-4 px-3 pt-4">
        <input
          type="text"
          placeholder="Search photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/5 bg-[var(--color-black-surface)] px-4 py-3 text-sm text-white/90 shadow-[var(--shadow-neu-black-inset-sm)] placeholder:text-white/30 focus:border-white/10 focus:outline-none focus:shadow-[var(--shadow-neu-black-active)]"
        />
      </div>

      {isLoading && (
        <div className="py-20 text-center text-sm text-white/40">Loading...</div>
      )}

      {photos && photos.length > 0 && (
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: 'calc((100vw - 6px) / 3 / (16/9))',
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative h-full w-full cursor-pointer overflow-hidden rounded-[6px]"
              style={{
                boxShadow: 'var(--shadow-neu-black)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-neu-black-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-neu-black)'
              }}
            >
              <img
                src={photoUrl(photo.path)}
                alt={photo.caption}
                loading="lazy"
                className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
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
