# 空荧酒馆地图点位标记系统

<div align="center">
  <img src="./public/favicon.ico" >
  <h2>空荧后厨</h2>
  <div>
    <a href="https://cn.vuejs.org" target="_blank">
      <img src="https://img.shields.io/badge/Vue-3.2-green">
    </a>
    <a href="https://cn.vitejs.dev" target="_blank">
      <img src="https://img.shields.io/badge/Vite-4.1-green">
    </a>
    <a href="https://www.typescriptlang.org" target="_blank">
      <img src="https://img.shields.io/badge/TS-next-blue">
    </a>
    <a href="https://deck.gl" target="_blank">
      <img src="https://img.shields.io/badge/deck.gl-8.9-B77546">
    </a>
  </div>
</div>

## 项目简介

目前 v1 转入归档阶段。
v2 版正在开发基于 deck.gl 实现的高性能地图，同时围绕多类型缓存系统构建 PWA，实现客户端级使用体验。

## 安装依赖

```bash
# 推荐
pnpm i
# or
yarn
# or
npm install
```

### 添加依赖

非打包依赖请务必安装到 `devDependencies` 字段中

```base
pnpm add <package-name> [--save-dev, --save-peer]
```

### 开发模式

```bash
pnpm dev
# or
yarn run dev
# or
npm run dev
```

### 开发模式（离线环境）

当开发服务器正在维护，暂时无法访问时，可能会需要用到这个模式。在根目录创建 .env.development.local，增加一行：
```properties
VITE_DEVELOPMENT_MODE = 'offline'
```
然后再使用上述的开发模式启动

### Lint the files

```bash
pnpm run lint
# or
yarn run lint
# or
npm run lint
```

### Format the files

代码格式化已托管给 eslint，执行 lint 命令时会自动格式化。

### 构建生产模式

```bash
pnpm run build
# or
yarn run build
# or
npm run build
```

### 项目贡献

![Alt](https://repobeats.axiom.co/api/embed/7910e599e7842fa48c48295b7fcbf0d4e39a9c6b.svg "Repobeats analytics image")
