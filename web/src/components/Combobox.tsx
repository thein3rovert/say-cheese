import { useState, useRef, useEffect } from 'react'

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  label: string
}

export function Combobox({ value, onChange, options, placeholder, label }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(filter.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setFilter(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => {
          setFilter(value)
          setIsOpen(true)
        }}
        placeholder={placeholder}
        className="w-full rounded-sm bg-black-surface px-3 py-2 text-sm text-white/90 placeholder-white/30 outline-none transition-shadow"
        style={{
          boxShadow: 'var(--shadow-neu-black-inset)',
        }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-sm bg-black-surface"
          style={{
            boxShadow: 'var(--shadow-neu-black)',
          }}
        >
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option)
                setIsOpen(false)
                setFilter('')
              }}
              className="block w-full px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
