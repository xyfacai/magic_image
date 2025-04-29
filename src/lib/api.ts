import { storage } from "./storage"
import { GenerationModel, AspectRatio } from "@/types"
import { toast } from "sonner"

export interface GenerateImageRequest {
  prompt: string
  model: GenerationModel
  sourceImage?: string
  isImageToImage?: boolean
  aspectRatio?: AspectRatio
}

export interface StreamCallback {
  onMessage: (content: string) => void
  onComplete: (imageUrl: string) => void
  onError: (error: string) => void
}

export const api = {
  generateImage: async (request: GenerateImageRequest, callbacks: StreamCallback) => {
    const config = storage.getApiConfig()
    if (!config) {
      toast.error("请先设置 API 配置")
      throw new Error('请先设置 API 配置')
    }

    if (!config.key || !config.baseUrl) {
      toast.error("API 配置不完整，请检查 API Key 和基础地址")
      throw new Error('API 配置不完整')
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
        const errorMessage = errorData.error?.message || '生成图片失败'
        callbacks.onError(errorMessage)
        toast.error(errorMessage)
      } catch {
        callbacks.onError('生成图片失败')
        toast.error('生成图片失败')
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