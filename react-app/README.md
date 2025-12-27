# React + Vite 项目

一个现代化的 React 应用，使用 Vite、Styled Components、Lucide React 图标和 Framer Motion 动画库构建。

## 🚀 技术栈

- **React 18** - 用于构建用户界面的 JavaScript 库
- **Vite** - 下一代前端构建工具，提供极速的开发体验
- **Styled Components** - CSS-in-JS 解决方案，支持组件化样式
- **Lucide React** - 美观且一致的图标库
- **Framer Motion** - 强大的 React 动画库

## 📦 安装依赖

```bash
cd react-app
npm install
```

## 🛠️ 开发

启动开发服务器：

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动并自动打开浏览器。

## 🏗️ 构建

构建生产版本：

```bash
npm run build
```

构建后的文件将输出到 `dist` 目录。

## 👀 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
react-app/
├── public/              # 静态资源
│   └── vite.svg
├── src/
│   ├── components/      # React 组件
│   │   └── ExampleButton.jsx
│   ├── styles/          # 全局样式
│   │   └── global.css
│   ├── App.jsx          # 主应用组件
│   └── main.jsx         # 入口文件
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
└── .eslintrc.cjs        # ESLint 配置
```

## ✨ 特性

- ⚡️ 极速的 HMR（热模块替换）
- 🎨 使用 Styled Components 编写组件样式
- 🎭 Framer Motion 提供流畅的动画效果
- 🎯 Lucide React 提供丰富的图标库
- 📱 响应式设计
- 🔧 ESLint 代码检查

## 📝 使用示例

### 创建带动画的按钮组件

```jsx
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

const Button = styled(motion.button)`
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`

function MyButton() {
  return (
    <Button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Heart size={24} />
      点击我
    </Button>
  )
}
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

