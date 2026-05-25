import { useState, useCallback, useEffect } from 'react'
import { usePhotos, usePhotoSearch, useDeletePhoto, useUpdatePhoto } from '../api/photos'
import type { Photo, Tag } from '../api/photos'

function photoUrl(path: string) {
  return `/${path}`
}

interface LightboxProps {
  photo: Photo
  onClose: () => void
  onDelete?: (id: string) => void
  onEdit?: (photo: Photo) => void
  isAdmin?: boolean
}

function Lightbox({ photo, onClose, onDelete, onEdit, isAdmin = false }: LightboxProps) {
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
          className="absolute top-4 z-10 rounded-full p-2 text-white/60 transition-colors hover:text-white/90"
          style={{
            right: 'var(--spacing-4)',
            width: 'var(--modal-btn-size)',
            height: 'var(--modal-btn-size)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-neu-black-inset)',
            background: 'var(--color-black-base)',
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Edit button - Admin only */}
        {isAdmin && onEdit && (
          <button
            onClick={() => onEdit(photo)}
            className="absolute top-4 z-10 rounded-full p-2 text-white/60 transition-colors hover:text-white/90"
            style={{
              right: 'var(--modal-btn-offset)',
              width: 'var(--modal-btn-size)',
              height: 'var(--modal-btn-size)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-neu-black-inset)',
              background: 'var(--color-black-base)',
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Delete button - Admin only */}
        {isAdmin && onDelete && (
          <button
            onClick={() => {
              if (confirm('Delete this photo?')) {
                onDelete(photo.id)
              }
            }}
            className="absolute top-4 z-10 rounded-full p-2 text-red-400 transition-colors hover:text-red-300"
            style={{
              left: 'var(--spacing-4)',
              width: 'var(--modal-btn-size)',
              height: 'var(--modal-btn-size)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-neu-black-inset)',
              background: 'var(--color-black-base)',
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Image */}
        <img
          src={photoUrl(photo.path)}
          alt={photo.caption}
          className="max-h-[80vh] max-w-[90vw] object-contain"
        />

        {/* Caption overlay at bottom */}
        {(photo.caption || photo.camera || photo.location || (photo.tags && photo.tags.length > 0)) && (
          <div
            className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/60 to-transparent"
            style={{ padding: 'var(--spacing-6)' }}
          >
            {photo.caption && (
              <p className="text-base font-medium text-white/90">{photo.caption}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
              {photo.camera && <span>{photo.camera}</span>}
              {photo.lens && <span>{photo.lens}</span>}
              {photo.aperture && <span>{photo.aperture}</span>}
              {photo.shutter_speed && <span>{photo.shutter_speed}</span>}
              {photo.iso && <span>ISO {photo.iso}</span>}
              {photo.location && <span>{photo.location}</span>}
              {photo.date_taken && <span>{photo.date_taken}</span>}
            </div>
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

interface EditModalProps {
  photo: Photo
  onClose: () => void
  onSave: (photo: Photo) => void
  isSaving: boolean
}

function EditModal({ photo, onClose, onSave, isSaving }: EditModalProps) {
  const [form, setForm] = useState({
    caption: photo.caption || '',
    description: photo.description || '',
    camera: photo.camera || '',
    lens: photo.lens || '',
    aperture: photo.aperture || '',
    shutter_speed: photo.shutter_speed || '',
    iso: photo.iso || '',
    location: photo.location || '',
    date_taken: photo.date_taken || '',
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ ...photo, ...form })
  }

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

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-black-elevated)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.875rem',
    width: '100%',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 'var(--spacing-1)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black-base/90 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden bg-black-surface"
        style={{
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-neu-black-inset)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          className="flex items-center justify-between border-b border-white/5"
          style={{
            padding: 'var(--spacing-4) var(--spacing-6)',
          }}
        >
          <h2 className="text-base font-medium text-white/90">Edit Photo</h2>
          <button
            onClick={onClose}
            className="text-white/60 transition-colors hover:text-white/90"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-6)' }}>
          <div className="space-y-4">
            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                value={form.caption}
                onChange={(e) => handleChange('caption', e.target.value)}
                style={inputStyle}
                placeholder="EVENING WALKS"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Camera</label>
                <input
                  type="text"
                  value={form.camera}
                  onChange={(e) => handleChange('camera', e.target.value)}
                  style={inputStyle}
                  placeholder="FUJIFILM X-E4"
                />
              </div>
              <div>
                <label style={labelStyle}>Lens</label>
                <input
                  type="text"
                  value={form.lens}
                  onChange={(e) => handleChange('lens', e.target.value)}
                  style={inputStyle}
                  placeholder="23mm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label style={labelStyle}>Aperture</label>
                <input
                  type="text"
                  value={form.aperture}
                  onChange={(e) => handleChange('aperture', e.target.value)}
                  style={inputStyle}
                  placeholder="f/2.8"
                />
              </div>
              <div>
                <label style={labelStyle}>Shutter</label>
                <input
                  type="text"
                  value={form.shutter_speed}
                  onChange={(e) => handleChange('shutter_speed', e.target.value)}
                  style={inputStyle}
                  placeholder="1/500s"
                />
              </div>
              <div>
                <label style={labelStyle}>ISO</label>
                <input
                  type="text"
                  value={form.iso}
                  onChange={(e) => handleChange('iso', e.target.value)}
                  style={inputStyle}
                  placeholder="400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  style={inputStyle}
                  placeholder="Tokyo, Japan"
                />
              </div>
              <div>
                <label style={labelStyle}>Date Taken</label>
                <input
                  type="text"
                  value={form.date_taken}
                  onChange={(e) => handleChange('date_taken', e.target.value)}
                  style={inputStyle}
                  placeholder="4/14/2026"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Add a description..."
              />
            </div>
          </div>

          <div
            className="flex justify-end gap-3 border-t border-white/5"
            style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-4)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-white/60 transition-colors hover:text-white/90"
              style={{
                padding: 'var(--spacing-2) var(--spacing-4)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
              style={{
                padding: 'var(--spacing-2) var(--spacing-4)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-black-elevated)',
                boxShadow: 'var(--shadow-neu-black-sm)',
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
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
