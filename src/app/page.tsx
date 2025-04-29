"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, Download, Edit, Settings, History, Image as ImageIcon, MessageSquare, Upload } from "lucide-react"
import Image from "next/image"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { HistoryDialog } from "@/components/history-dialog"
import { useState, useRef } from "react"
import { api } from "@/lib/api"
import { GenerationModel, AspectRatio } from "@/types"
import { storage } from "@/lib/storage"
import { v4 as uuidv4 } from 'uuid'

export default function Home() {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState<GenerationModel>("sora_image")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamContent, setStreamContent] = useState<string>("")
  const [isImageToImage, setIsImageToImage] = useState(false)
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1")
  const contentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError("图片大小不能超过4MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setSourceImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (isImageToImage && !sourceImage) {
      setError("请先上传或选择图片")
      return
    }
    if (!prompt.trim()) {
      setError("请输入提示词")
      return
    }

    setError(null)
    setIsGenerating(true)
    setGeneratedImage(null)
    setStreamContent("")

    try {
      const finalPrompt = `${prompt.trim()}\n图片生成比例为：${aspectRatio}`
      await api.generateImage(
        {
          prompt: finalPrompt,
          model,
          sourceImage: isImageToImage && sourceImage ? sourceImage : undefined,
          isImageToImage,
          aspectRatio
        },
        {
          onMessage: (content) => {
            setStreamContent(prev => prev + content)
            if (contentRef.current) {
              contentRef.current.scrollTop = contentRef.current.scrollHeight
            }
          },
          onComplete: (imageUrl) => {
            setGeneratedImage(imageUrl)
            storage.addToHistory({
              id: uuidv4(),
              prompt: finalPrompt,
              url: imageUrl,
              model,
              createdAt: new Date().toISOString(),
              aspectRatio
            })
          },
          onError: (error) => {
            setError(error)
          }
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setPrompt("")
    setGeneratedImage(null)
    setError(null)
    setStreamContent("")
    setSourceImage(null)
    setAspectRatio("1:1")
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 顶部提示栏 */}
      <div className="w-full bg-blue-50 p-4">
        <div className="container mx-auto flex justify-center text-sm text-blue-700">
          <Info className="h-4 w-4 mr-2" />
          <p>数据安全提示：所有生成的图片和历史记录仅保存在本地浏览器中。请及时下载并备份重要图片。使用隐私模式或更换设备会导致数据丢失无法恢复。</p>
        </div>
      </div>

      {/* 标题区域 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold">AI 绘画助手</h1>
        <p className="text-gray-500 mt-2">通过简单的文字描述，创造精美的AI艺术作品</p>
      </div>

      <div className="container mx-auto px-4 pb-8 max-w-[1200px]">
        <div className="grid grid-cols-[300px_1fr] gap-6">
          {/* 左侧控制面板 */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowApiKeyDialog(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    密钥设置
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowHistoryDialog(true)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    历史记录
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">生成模式</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={isImageToImage ? "outline" : "secondary"} 
                      className="w-full"
                      onClick={() => setIsImageToImage(false)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      文生图
                    </Button>
                    <Button 
                      variant={isImageToImage ? "secondary" : "outline"}
                      className="w-full"
                      onClick={() => setIsImageToImage(true)}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      图生图
                    </Button>
                  </div>
                </div>

                {isImageToImage && (
                  <div className="space-y-2">
                    <h3 className="font-medium">上传图片进行编辑</h3>
                    <div 
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {sourceImage ? (
                        <div className="relative aspect-square w-full">
                          <Image
                            src={sourceImage}
                            alt="Source"
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload className="h-8 w-8" />
                          <p>点击上传图片或拖拽图片到这里</p>
                          <p className="text-xs">支持JPG、PNG格式，最大4MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium">提示词</h3>
                  <Textarea 
                    placeholder="描述你想要生成的图像，例如：一只可爱的猫咪，柔软的毛发，大眼睛，阳光下微笑..."
                    className="min-h-[120px]"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">模型选择</h3>
                  <Select value={model} onValueChange={(value: GenerationModel) => setModel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择生成模型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sora_image">GPT Sora_Image 模型</SelectItem>
                      <SelectItem value="gpt_4o_image">GPT 4o_Image 模型</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">选择不同的AI模型可能会产生不同风格的图像结果</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">图片比例</h3>
                  <Select value={aspectRatio} onValueChange={(value: AspectRatio) => setAspectRatio(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择图片比例" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">1:1 方形</SelectItem>
                      <SelectItem value="16:9">16:9 宽屏</SelectItem>
                      <SelectItem value="9:16">9:16 竖屏</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? "生成中..." : isImageToImage ? "编辑图片" : "生成图片"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReset}
                >
                  重置
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧内容区 */}
          <Card className="min-h-[calc(100vh-13rem)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">生成结果</h2>
                {generatedImage && (
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost">
                      <Download className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => {
                        setIsImageToImage(true)
                        setSourceImage(generatedImage)
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-stretch justify-start p-6 h-full">
              {error ? (
                <div className="text-center text-red-500">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col gap-4">
                  <div 
                    ref={contentRef}
                    className="flex-1 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm min-h-[200px]"
                  >
                    {streamContent || (
                      <div className="text-gray-400 text-center">
                        {isGenerating ? "正在生成中..." : "等待生成..."}
                      </div>
                    )}
                  </div>
                  {generatedImage && (
                    <div className="relative w-full aspect-square max-w-2xl mx-auto">
                      <Image
                        src={generatedImage}
                        alt={prompt}
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ApiKeyDialog 
        open={showApiKeyDialog} 
        onOpenChange={setShowApiKeyDialog} 
      />
      <HistoryDialog 
        open={showHistoryDialog} 
        onOpenChange={setShowHistoryDialog}
        onEditImage={(imageUrl) => {
          setIsImageToImage(true)
          setSourceImage(imageUrl)
        }}
      />

      <footer className="w-full py-4 text-center text-sm text-gray-500">
        <a 
          href="https://magic666.top" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          本产品由 MagicAPI 研发 ，点击进行跳转
        </a>
      </footer>
    </main>
  )
}
