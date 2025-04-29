import { ApiConfig, GeneratedImage } from "@/types"

const STORAGE_KEYS = {
  API_CONFIG: 'ai-drawing-api-config',
  HISTORY: 'ai-drawing-history'
}

export const storage = {
  // API 配置相关操作
  getApiConfig: (): ApiConfig | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.API_CONFIG)
    return data ? JSON.parse(data) : null
  },

  setApiConfig: (key: string, baseUrl: string): void => {
    if (typeof window === 'undefined') return
    const apiConfig: ApiConfig = {
      key,
      baseUrl,
      createdAt: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(apiConfig))
  },

  removeApiConfig: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.API_CONFIG)
  },

  // 历史记录相关操作
  getHistory: (): GeneratedImage[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return data ? JSON.parse(data) : []
  },

  addToHistory: (image: GeneratedImage): void => {
    if (typeof window === 'undefined') return
    const history = storage.getHistory()
    history.unshift(image)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
  },

  clearHistory: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
  },

  removeFromHistory: (id: string): void => {
    if (typeof window === 'undefined') return
    const history = storage.getHistory()
    const filtered = history.filter(img => img.id !== id)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered))
  }
} 