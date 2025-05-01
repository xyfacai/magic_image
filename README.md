# AI 绘画助手

<div align="right">中文 | <a href="README-EN.md">English</a></div>

[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)

一个基于 Next.js 开发的 AI 绘画应用，支持多种 AI 模型，提供文生图和图生图功能。

## 在线体验

访问地址：[https://image-front-eight.vercel.app/](https://image-front-eight.vercel.app/)

## 功能特点

- 🎨 支持多种 AI 模型
  - GPT Sora_Image 模型
  - GPT 4o_Image 模型
  - GPT Image 1 模型
  - DALL-E 3 模型
- ✍️ 文生图功能
  - 支持自定义提示词
  - 可选择图片比例
  - 支持多种图片尺寸
- 🖼️ 图生图功能
  - 支持图片编辑
  - 支持区域遮罩编辑
  - 支持图片质量调整
- 🔒 数据安全
  - 所有生成的图片和历史记录仅保存在本地浏览器中
  - 支持自定义 API 代理地址
  - 支持 API Key 配置
- 📱 UI设计
  - 现代化的用户界面
  - 流畅的交互体验

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- React

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/HappyDongD/image_front.git
cd image_front
```

2. 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

4. 访问 [http://localhost:3000](http://localhost:3000)

## Vercel 部署

1. Fork 本项目到你的 GitHub 账号

2. 在 [Vercel](https://vercel.com) 上创建新项目

3. 导入你的 GitHub 仓库

4. 点击部署

## 使用说明

1. 首次使用需要配置 API 密钥
   - 点击右上角的"密钥设置"
   - 输入 API 密钥和基础地址
   - 点击保存

2. 选择生成模式
   - 文生图：通过文字描述生成图片
   - 图生图：上传图片进行编辑

3. 设置生成参数
   - 选择 AI 模型
   - 设置图片比例
   - 调整图片质量（图生图模式）

4. 生成图片
   - 输入提示词
   - 点击"生成图片"按钮
   - 等待生成完成

5. 图片管理
   - 查看历史记录
   - 下载生成的图片
   - 编辑已有图片

## 注意事项

- 所有生成的图片和历史记录仅保存在本地浏览器中
- 使用隐私模式或更换设备会导致数据丢失
- 请及时下载并备份重要图片
- API 配置将安全地存储在您的浏览器中，不会上传到服务器

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License
