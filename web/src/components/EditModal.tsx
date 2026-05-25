import { useState, useEffect } from 'react'
import type { Photo } from '../api/photos'
import { Combobox } from './Combobox'
import {
  COMMON_CAMERAS,
  COMMON_LENSES,
  COMMON_APERTURES,
  COMMON_SHUTTERS,
  COMMON_ISOS,
  COMMON_LOCATIONS,
} from '../constants/photoMetadata'

interface EditModalProps {
  photo: Photo
  onClose: () => void
  onSave: (photo: Photo) => void
  isSaving: boolean
}

export function EditModal({ photo, onClose, onSave, isSaving }: EditModalProps) {
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
              <Combobox
                label="Camera"
                value={form.camera}
                onChange={(value) => handleChange('camera', value)}
                options={COMMON_CAMERAS}
                placeholder="FUJIFILM X-E4"
              />
              <Combobox
                label="Lens"
                value={form.lens}
                onChange={(value) => handleChange('lens', value)}
                options={COMMON_LENSES}
                placeholder="23mm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Combobox
                label="Aperture"
                value={form.aperture}
                onChange={(value) => handleChange('aperture', value)}
                options={COMMON_APERTURES}
                placeholder="F/2.8"
              />
              <Combobox
                label="Shutter"
                value={form.shutter_speed}
                onChange={(value) => handleChange('shutter_speed', value)}
                options={COMMON_SHUTTERS}
                placeholder="1/500S"
              />
              <Combobox
                label="ISO"
                value={form.iso}
                onChange={(value) => handleChange('iso', value)}
                options={COMMON_ISOS}
                placeholder="400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Combobox
                label="Location"
                value={form.location}
                onChange={(value) => handleChange('location', value)}
                options={COMMON_LOCATIONS}
                placeholder="Tokyo, Japan"
              />
              <div>
                <label style={labelStyle}>Date Taken</label>
                <input
                  type="date"
                  value={form.date_taken}
                  onChange={(e) => handleChange('date_taken', e.target.value)}
                  style={inputStyle}
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
