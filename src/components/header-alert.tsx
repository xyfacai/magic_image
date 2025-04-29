import { Info, X } from "lucide-react"
import { useState } from "react"

export function HeaderAlert() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="w-full bg-blue-50 p-4">
      <div className="container mx-auto flex items-center gap-2 text-sm text-blue-700">
        <Info className="h-4 w-4" />
        <p>数据安全提示：所有生成的图片和历史记录仅保存在本地浏览器中。请及时下载并备份重要图片。使用隐私模式或更换设备会导致数据丢失无法恢复。</p>
        <button className="ml-auto" onClick={() => setIsVisible(false)}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 