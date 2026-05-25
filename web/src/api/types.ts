export interface Tag {
  id: number
  name: string
}

export interface Photo {
  id: string
  filename: string
  path: string
  thumbnail_path: string
  caption: string
  description: string
  camera: string
  lens: string
  aperture: string
  shutter_speed: string
  iso: string
  location: string
  date_taken: string
  tags: Tag[] | null
  created_at: string
}
