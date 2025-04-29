import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const [key, setKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [errors, setErrors] = useState<{ key?: string; baseUrl?: string }>({})

  useEffect(() => {
    const config = storage.getApiConfig()
    if (config) {
      setKey(config.key)
      setBaseUrl(config.baseUrl)
    }
  }, [open])

  const validateInputs = () => {
    const newErrors: { key?: string; baseUrl?: string } = {}
    if (!key.trim()) {
      newErrors.key = "请输入 API Key"
    }
    if (!baseUrl.trim()) {
      newErrors.baseUrl = "请输入 API 基础地址"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateInputs()) return
    
    storage.setApiConfig(key.trim(), baseUrl.trim())
    toast.success("保存成功")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API 配置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div>
              <Input
                placeholder="请输入 API 基础地址"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value)
                  setErrors(prev => ({ ...prev, baseUrl: undefined }))
                }}
                className={errors.baseUrl ? "border-red-500" : ""}
              />
              {errors.baseUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.baseUrl}</p>
              )}
            </div>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="请输入您的 API Key"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value)
                  setErrors(prev => ({ ...prev, key: undefined }))
                }}
                className={`pr-10 ${errors.key ? "border-red-500" : ""}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {errors.key && (
                <p className="text-sm text-red-500 mt-1">{errors.key}</p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              API 配置将安全地存储在您的浏览器中，不会上传到服务器
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 