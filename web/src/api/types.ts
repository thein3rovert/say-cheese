export interface Photo {
  id: number
  filename: string
  path: string
  caption: string
  description: string
  tags: { id: number; name: string }[] | null
  created_at: string
}
