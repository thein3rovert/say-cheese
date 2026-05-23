import { useRef } from 'react'
import Gallery from './components/Gallery'
import { useUploadPhoto } from './api/photos'

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadPhoto()

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      upload.mutate(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="min-h-screen w-screen bg-black-base" style={{ margin: 0, padding: 0 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <header 
        className="border-b border-white/5 py-4"
        style={{
          paddingLeft: 'var(--photo-grid-padding-x)',
          paddingRight: 'var(--photo-grid-padding-x)',
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium tracking-tight text-white/90">
            say_cheese
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleUploadClick}
              className="rounded-lg p-2 text-white/60 transition hover:text-white/90"
              aria-label="Upload"
              disabled={upload.isPending}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <button
              className="rounded-lg p-2 text-white/60 transition hover:text-white/90"
              aria-label="RSS"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
            <button
              className="rounded-lg p-2 text-white/60 transition hover:text-white/90"
              aria-label="Menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main>
        <Gallery />
      </main>
    </div>
  )
}
