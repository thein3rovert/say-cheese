export interface Tag {
  id: number
  name: string
}

export interface Photo {
  id: number
  filename: string
  path: string
  caption: string
  description: string
  tags: Tag[] | null
  created_at: string
}
