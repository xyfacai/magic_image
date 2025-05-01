import { storage } from "./storage"
import { GenerationModel, AspectRatio, ImageSize } from "@/types"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

export interface GenerateImageRequest {
  prompt: string
  model: GenerationModel
  sourceImage?: string
  isImageToImage?: boolean
  aspectRatio?: AspectRatio
  size?: ImageSize
  n?: number
  quality?: 'high' | 'medium' | 'low' | 'hd' | 'standard'| 'auto'
  mask?: string
}

export interface StreamCallback {
  onMessage: (content: string) => void
  onComplete: (imageUrl: string) => void
  onError: (error: string) => void
}

export interface DalleImageResponse {
  data: Array<{
    url: string
  }>
  created: number
}

const showErrorToast = (message: string) => {
  toast.error(message, {
    style: { color: '#EF4444' },  // text-red-500
    duration: 5000
  })
}

export const api = {
  generateDalleImage: async (request: GenerateImageRequest): Promise<DalleImageResponse> => {
    const config = storage.getApiConfig()
    if (!config) {
      showErrorToast("请先设置 API 配置")
      throw new Error('请先设置 API 配置')
    }

    if (!config.key || !config.baseUrl) {
      showErrorToast("API 配置不完整，请检查 API Key 和基础地址")
      throw new Error('API 配置不完整')
    }

    const response = await fetch(`${config.baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        size: request.size || 'auto',
        n: request.n || 1,
        quality: request.quality
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      const errorMessage = errorData.message || errorData.error?.message || '生成图片失败'
      const errorCode = errorData.code || errorData.error?.code
      const fullError = `${errorMessage}${errorCode ? `\n错误代码: ${errorCode}` : ''}`
      showErrorToast(fullError)
      throw new Error(fullError)
    }

    return response.json()
  },

  editDalleImage: async (request: GenerateImageRequest): Promise<DalleImageResponse> => {
    const config = storage.getApiConfig()
    if (!config) {
      showErrorToast("请先设置 API 配置")
      throw new Error('请先设置 API 配置')
    }

    if (!config.key || !config.baseUrl) {
      showErrorToast("API 配置不完整，请检查 API Key 和基础地址")
      throw new Error('API 配置不完整')
    }

    if (!request.sourceImage) {
      showErrorToast("请先上传图片")
      throw new Error('请先上传图片')
    }

    try {
      // 创建 FormData
      const formData = new FormData()
      formData.append('prompt', request.prompt)
      console.log(request.sourceImage)
      // 处理源图片
      const sourceImageResponse = await fetch(request.sourceImage)
      if (!sourceImageResponse.ok) {
        throw new Error('获取源图片失败')
      }
      const sourceImageBlob = await sourceImageResponse.blob()
      formData.append('image', sourceImageBlob, 'image.png')
      
      // 处理遮罩图片
      if (request.mask) {
        console.log(request.mask)
        const maskResponse = await fetch(request.mask)
        if (!maskResponse.ok) {
          throw new Error('获取遮罩图片失败')
        }
        const maskBlob = await maskResponse.blob()
        formData.append('mask', maskBlob, 'mask.png')
      }

      formData.append('model', request.model)
      if (request.size) formData.append('size', request.size)
      if (request.n) formData.append('n', request.n.toString())
      if (request.quality) formData.append('quality', request.quality)

      const response = await fetch(`${config.baseUrl}/v1/images/edits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.key}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error?.message || '编辑图片失败'
        const errorCode = errorData.code || errorData.error?.code
        const fullError = `${errorMessage}${errorCode ? `\n错误代码: ${errorCode}` : ''}`
        showErrorToast(fullError)
        throw new Error(fullError)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(error.message)
        throw error
      }
      const errorMessage = '编辑图片失败'
      showErrorToast(errorMessage)
      throw new Error(errorMessage)
    }
  },

  generateStreamImage: async (request: GenerateImageRequest, callbacks: StreamCallback) => {
    const config = storage.getApiConfig()
    if (!config) {
      const error = '请先设置 API 配置'
      showErrorToast(error)
      callbacks.onError(error)
      return
    }

    if (!config.key || !config.baseUrl) {
      const error = 'API 配置不完整，请检查 API Key 和基础地址'
      showErrorToast(error)
      callbacks.onError(error)
      return
    }

    const messages = request.isImageToImage ? [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: request.prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: request.sourceImage
            }
          }
        ]
      }
    ] : [
      {
        role: 'user',
        content: request.prompt
      }
    ]

    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: request.model,
        messages,
        stream: true
      })
    })

    if (!response.ok) {
      try {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error?.message || '生成图片失败'
        const errorCode = errorData.code || errorData.error?.code
        const fullError = `${errorMessage}${errorCode ? `\n错误代码: ${errorCode}` : ''}`
        callbacks.onError(fullError)
        showErrorToast(fullError)
      } catch {
        const error = '生成图片失败'
        callbacks.onError(error)
        showErrorToast(error)
      }
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError('读取响应失败')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue

          try {
            const jsonStr = trimmedLine.replace(/^data: /, '')
            const data = JSON.parse(jsonStr)

            if (data.choices?.[0]?.delta?.content) {
              const content = data.choices[0].delta.content
              callbacks.onMessage(content)

              const urlMatch = content.match(/\[.*?\]\((.*?)\)/)
              if (urlMatch && urlMatch[1]) {
                callbacks.onComplete(urlMatch[1])
                return
              }
            }
          } catch (e) {
            console.warn('解析数据行失败:', e)
          }
        }
      }

      if (buffer.trim()) {
        try {
          const jsonStr = buffer.trim().replace(/^data: /, '')
          const data = JSON.parse(jsonStr)
          if (data.choices?.[0]?.delta?.content) {
            const content = data.choices[0].delta.content
            callbacks.onMessage(content)

            const urlMatch = content.match(/\[.*?\]\((.*?)\)/)
            if (urlMatch && urlMatch[1]) {
              callbacks.onComplete(urlMatch[1])
            }
          }
        } catch (e) {
          console.warn('解析最后的数据失败:', e)
        }
      }
    } catch (error) {
      console.error('处理流数据失败:', error)
      callbacks.onError('处理响应数据失败')
    }
    reader.releaseLock()
  }
} 