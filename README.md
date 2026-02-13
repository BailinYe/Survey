# Survey 项目

一个问卷调查系统，包含前后端分离架构。

## 项目结构

```
Survey/
├── backend/          # 后端服务 (Node.js + Express + TypeScript)
├── frontend/         # 前端应用 (React + Vite + TypeScript)
└── README.md
```

## 技术栈

### Backend

- Node.js
- Express.js
- TypeScript
- tsx (开发运行时)

### Frontend

- React
- Vite
- TypeScript

## 快速开始

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 开发模式

**启动后端服务：**

```bash
cd backend
npm run dev
```

默认运行在 http://localhost:3000

**启动前端服务：**

```bash
cd frontend
npm run dev
```

默认运行在 http://localhost:5173

### 生产构建

**构建后端：**

```bash
cd backend
npm run build
npm start
```

**构建前端：**

```bash
cd frontend
npm run build
```

## API 接口

- `GET /` - 服务信息
- `GET /health` - 健康检查

## 开发指南

1. 克隆仓库后先安装依赖
2. 后端和前端需要分别启动
3. 确保后端服务先启动
4. 代码提交前请确保类型检查通过

## License

ISC
