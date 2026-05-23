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
    <div className="gallery">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {isLoading && <div className="loading">Loading...</div>}

      {photos && (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img
                src={photoUrl(photo.path)}
                alt={photo.caption}
                loading="lazy"
              />
              <div className="photo-info">
                <p className="caption">{photo.caption}</p>
                {photo.tags && photo.tags.length > 0 && (
                  <div className="tags">
                    {photo.tags.map((tag) => (
                      <span key={tag.id} className="tag">{tag.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {photos && photos.length === 0 && (
        <div className="empty">No photos found</div>
      )}
    </div>
  )
}
