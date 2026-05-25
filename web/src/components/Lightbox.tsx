import { useEffect } from 'react'
import type { Photo } from '../api/photos'

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

export function Lightbox({ photo, onClose, onDelete, onEdit, isAdmin = false }: LightboxProps) {
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
