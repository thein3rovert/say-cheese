export interface Tag {
  id: number
  name: string
}

export interface Photo {
  id: string
  filename: string
  path: string
  caption: string
  description: string
  tags: Tag[] | null
  created_at: string
}
