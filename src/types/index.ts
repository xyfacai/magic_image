export interface GeneratedImage {
  id: string
  prompt: string
  url: string
  model: string
  createdAt: string
  aspectRatio: string
}

export interface ApiConfig {
  key: string
  baseUrl: string
  createdAt: string
  lastUsed?: string
}

export type GenerationModel = 'sora_image' | 'gpt_4o_image'
export type AspectRatio = '1:1' | '16:9' | '9:16' 