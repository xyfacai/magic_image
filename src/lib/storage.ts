import { ApiConfig, GeneratedImage, CustomModel, ModelType } from "@/types"

const STORAGE_KEYS = {
  API_CONFIG: 'ai-drawing-api-config',
  HISTORY: 'ai-drawing-history',
  CUSTOM_MODELS: 'ai-drawing-custom-models'
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
  },

  // 自定义模型相关操作
  getCustomModels: (): CustomModel[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_MODELS)

    let defaultModels: CustomModel[] = [
      {
        id: 'flux-kontext-pro',
        name: 'flux-kontext-pro',
        value: 'flux-kontext-pro',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'flux-kontext-max',
        name: 'flux-kontext-max',
        value: 'flux-kontext-max',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'flux-kontext-dev',
        name: 'flux-kontext-dev',
        value: 'flux-kontext-dev',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'qwen-image-edit',
        name: 'qwen-image-edit',
        value: 'qwen-image-edit',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'qwen-image',
        name: 'qwen-image',
        value: 'qwen-image',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'flux-dev',
        name: 'flux-dev',
        value: 'flux-dev',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'flux-pro',
        name: 'flux-pro',
        value: 'flux-pro',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'flux-1.1-pro',
        name: 'flux-1.1-pro',
        value: 'flux-1.1-pro',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      },
      {
        id: 'flux-pro-1.1-ultra',
        name: 'flux-pro-1.1-ultra',
        value: 'flux-pro-1.1-ultra',
        type: ModelType.DALLE,
        createdAt: new Date().toISOString()
      }
    ]

    if (!data) {
      return defaultModels
    }
    const parsedData = JSON.parse(data)
    parsedData.push(...defaultModels)
    return parsedData
  },

  addCustomModel: (model: CustomModel): void => {
    if (typeof window === 'undefined') return
    const models = storage.getCustomModels()
    models.push(model)
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models))
  },

  removeCustomModel: (id: string): void => {
    if (typeof window === 'undefined') return
    const models = storage.getCustomModels()
    const filtered = models.filter(model => model.id !== id)
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(filtered))
  },

  updateCustomModel: (id: string, updated: Partial<CustomModel>): void => {
    if (typeof window === 'undefined') return
    const models = storage.getCustomModels()
    const index = models.findIndex(model => model.id === id)
    if (index !== -1) {
      models[index] = { ...models[index], ...updated }
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models))
    }
  }
} 