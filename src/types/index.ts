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

export type GenerationModel = 'sora_image' | 'gpt_4o_image' | 'gpt-image-1' | 'dall-e-3'
export type AspectRatio = '1:1' | '16:9' | '9:16'
export type ImageSize = '1024x1024' | '1536x1024' | '1024x1536' | 'auto' | '1792x1024'

export interface GenerateImageRequest {
  prompt: string
  model: GenerationModel
  sourceImage?: string
  isImageToImage?: boolean
  aspectRatio?: AspectRatio
  size?: ImageSize
  n?: number
  quality?: 'auto' | 'high' | 'medium' | 'low' | 'hd' | 'standard'
  mask?: string
} 