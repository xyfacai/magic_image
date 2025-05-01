import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Eraser, Paintbrush, Undo, Redo, RotateCcw, Loader2 } from 'lucide-react'
import { Slider } from './ui/slider'

interface MaskEditorProps {
  imageUrl: string
  onMaskChange: (maskDataUrl: string) => void
  onClose: () => void
  initialMask?: string
}

export function MaskEditor({ imageUrl, onMaskChange, onClose, initialMask }: MaskEditorProps) {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEraser, setIsEraser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [brushSize, setBrushSize] = useState(30)
  const originalImageRef = useRef<HTMLImageElement | null>(null)
  const [opacity, setOpacity] = useState(0.4)
  const historyRef = useRef<string[]>([])
  const currentHistoryIndexRef = useRef(-1)

  // 保存当前状态到历史记录
  const saveToHistory = () => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return

    const newHistory = historyRef.current.slice(0, currentHistoryIndexRef.current + 1)
    newHistory.push(maskCanvas.toDataURL())
    historyRef.current = newHistory
    currentHistoryIndexRef.current = newHistory.length - 1
  }

  // 撤销
  const undo = () => {
    if (currentHistoryIndexRef.current > 0) {
      currentHistoryIndexRef.current--
      loadHistoryState()
    }
  }

  // 重做
  const redo = () => {
    if (currentHistoryIndexRef.current < historyRef.current.length - 1) {
      currentHistoryIndexRef.current++
      loadHistoryState()
    }
  }

  // 重置
  const reset = () => {
    const maskCanvas = maskCanvasRef.current
    const maskCtx = maskCanvas?.getContext('2d')
    if (!maskCanvas || !maskCtx) return

    maskCtx.fillStyle = 'black'
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
    saveToHistory()
    redrawDisplay()
  }

  // 加载历史状态
  const loadHistoryState = () => {
    const maskCanvas = maskCanvasRef.current
    const maskCtx = maskCanvas?.getContext('2d')
    if (!maskCanvas || !maskCtx) return

    const img = new Image()
    img.onload = () => {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      maskCtx.drawImage(img, 0, 0)
      redrawDisplay()
    }
    img.src = historyRef.current[currentHistoryIndexRef.current]
  }

  useEffect(() => {
    const displayCanvas = displayCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!displayCanvas || !maskCanvas) return

    const displayCtx = displayCanvas.getContext('2d')
    const maskCtx = maskCanvas.getContext('2d')
    if (!displayCtx || !maskCtx) return

    setIsLoading(true)
    const image = new window.Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      displayCanvas.width = image.width
      displayCanvas.height = image.height
      maskCanvas.width = image.width
      maskCanvas.height = image.height
      
      originalImageRef.current = image
      
      displayCtx.drawImage(image, 0, 0)
      
      // 如果有初始遮罩，加载它
      if (initialMask) {
        const maskImage = new Image()
        maskImage.onload = () => {
          maskCtx.drawImage(maskImage, 0, 0)
          saveToHistory()
          redrawDisplay()
          setIsLoading(false)
        }
        maskImage.src = initialMask
      } else {
        // 否则创建新的黑色遮罩
        maskCtx.fillStyle = 'black'
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
        saveToHistory()
        redrawDisplay()
        setIsLoading(false)
      }
    }
    image.src = imageUrl
  }, [imageUrl, initialMask])

  // 创建改进的网格图案
  const createGridPattern = (ctx: CanvasRenderingContext2D) => {
    const patternCanvas = document.createElement('canvas')
    patternCanvas.width = 20
    patternCanvas.height = 20
    const patternCtx = patternCanvas.getContext('2d')
    if (!patternCtx) return

    // 设置网格背景
    patternCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    patternCtx.fillRect(0, 0, 20, 20)

    // 绘制网格线
    patternCtx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`
    patternCtx.lineWidth = 0.5

    // 绘制垂直线
    for (let x = 0; x <= 20; x += 5) {
      patternCtx.beginPath()
      patternCtx.moveTo(x, 0)
      patternCtx.lineTo(x, 20)
      patternCtx.stroke()
    }

    // 绘制水平线
    for (let y = 0; y <= 20; y += 5) {
      patternCtx.beginPath()
      patternCtx.moveTo(0, y)
      patternCtx.lineTo(20, y)
      patternCtx.stroke()
    }

    return ctx.createPattern(patternCanvas, 'repeat')
  }

  const redrawDisplay = () => {
    const displayCanvas = displayCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!displayCanvas || !maskCanvas || !originalImageRef.current) return

    const displayCtx = displayCanvas.getContext('2d')
    const maskCtx = maskCanvas.getContext('2d')
    if (!displayCtx || !maskCtx) return

    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height)
    displayCtx.drawImage(originalImageRef.current, 0, 0)

    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
    const gridPattern = createGridPattern(displayCtx)
    if (!gridPattern) return

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = displayCanvas.width
    tempCanvas.height = displayCanvas.height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCtx.fillStyle = gridPattern

    for (let i = 0; i < maskData.data.length; i += 4) {
      if (maskData.data[i] === 255) {
        const x = (i / 4) % maskCanvas.width
        const y = Math.floor((i / 4) / maskCanvas.width)
        tempCtx.fillRect(x, y, 1, 1)
      }
    }

    displayCtx.drawImage(tempCanvas, 0, 0)
  }

  const draw = (e: MouseEvent | TouchEvent) => {
    const displayCanvas = displayCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!displayCanvas || !maskCanvas || !isDrawing) return

    const maskCtx = maskCanvas.getContext('2d')
    if (!maskCtx) return

    const rect = displayCanvas.getBoundingClientRect()
    const scaleX = displayCanvas.width / rect.width
    const scaleY = displayCanvas.height / rect.height

    let x: number, y: number
    if (e instanceof MouseEvent) {
      x = (e.clientX - rect.left) * scaleX
      y = (e.clientY - rect.top) * scaleY
    } else {
      x = (e.touches[0].clientX - rect.left) * scaleX
      y = (e.touches[0].clientY - rect.top) * scaleY
    }

    if (lastPos.current) {
      maskCtx.beginPath()
      maskCtx.moveTo(lastPos.current.x, lastPos.current.y)
      maskCtx.lineTo(x, y)
      maskCtx.strokeStyle = isEraser ? 'black' : 'white'
      maskCtx.lineWidth = brushSize
      maskCtx.lineCap = 'round'
      maskCtx.lineJoin = 'round'
      maskCtx.stroke()

      redrawDisplay()
    }
    lastPos.current = { x, y }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    lastPos.current = null
    
    if ('touches' in e) {
      draw(e.nativeEvent)
    } else {
      draw(e.nativeEvent)
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      lastPos.current = null
      saveToHistory()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    draw(e.nativeEvent)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    draw(e.nativeEvent)
  }

  const handleComplete = () => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return

    const maskDataUrl = maskCanvas.toDataURL('image/png')
    onMaskChange(maskDataUrl)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">编辑区域</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">笔刷大小</span>
                <Slider
                  value={[brushSize]}
                  onValueChange={(values: number[]) => setBrushSize(values[0])}
                  min={5}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">网格透明度</span>
                <Slider
                  value={[opacity * 100]}
                  onValueChange={(values: number[]) => {
                    setOpacity(values[0] / 100)
                    redrawDisplay()
                  }}
                  min={10}
                  max={80}
                  step={1}
                  className="w-24"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={!isEraser ? "default" : "outline"}
                  size="icon"
                  onClick={() => setIsEraser(false)}
                >
                  <Paintbrush className="h-4 w-4" />
                </Button>
                <Button
                  variant={isEraser ? "default" : "outline"}
                  size="icon"
                  onClick={() => setIsEraser(true)}
                >
                  <Eraser className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={undo}
                  disabled={currentHistoryIndexRef.current <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={redo}
                  disabled={currentHistoryIndexRef.current >= historyRef.current.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={reset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="relative border rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <canvas
              ref={displayCanvasRef}
              className="w-full h-full touch-none"
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={handleTouchMove}
              onTouchEnd={stopDrawing}
            />
            <canvas
              ref={maskCanvasRef}
              className="absolute top-0 left-0 opacity-0 pointer-events-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleComplete}>
              确认
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 