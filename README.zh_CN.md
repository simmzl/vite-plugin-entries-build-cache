# vite-plugin-entries-build-cache

[English](./README.md) | 简体中文 

`vite-plugin-entries-build-cache` 是一个 `Vite` 插件，它提供了一个缓存机制，通过校验项目文件变动，对输入的打包入口进行过滤，以加速多入口构建过程。

注意：该插件仅适用于多入口项目，且`vite` 配置中的 `build.emptyOutDir`需为 `false`。

## 安装

```bash
npm i vite-plugin-entries-build-cache -D
```

```bash
yarn add vite-plugin-entries-build-cache -D
```

## 使用

注册 Vite 插件：

```js
// vite.config.js
import entriesBuildCache from 'vite-plugin-entries-build-cache'
import { resolve } from 'path'

export default {
  plugins: [
    entriesBuildCache({
      entryRootPath: resolve(process.cwd(), './src/pages')
    })
  ]
}
```

## 配置

| 参数名：类型    | 默认值         | 说明               |
| ------------- | -------------- | ------------------ |
| `entryRootPath: string` | - | 多入口文件夹的父级绝对路径 |
| `rootPath?: string` | `process.cwd()` | 项目根目录绝对路径     |
| `exclude?: string[]` | `[]` | 需要额外排除的文件列表，`.gitignore`内的数据将一直被包含。 |
| `debug?: boolean` | `false` | 是否显示调试日志 |

注意：正确配置 `exclude` 参数，可以有效减少文件diff时间。因为该插件是对 `rootPath` 下所有文件进行 diff，而非依赖 `git`，所以如果 `rootPath` 下有大量文件，且这些文件不会影响到入口文件，如 `package-lock.json`，那么可以将这些文件配置到 `exclude` 中，从而减少 diff 时间。

## 示例

### 项目结构

```bash
├── src
│   ├── components
│   ├── pages
│   │   ├── index
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   └── index.vue
│   └── └── about
│           ├── index.html
│           ├── main.ts
│           └── index.vue
├── .gitignore
├── vite.config.js
├── package-lock.json
└── package.json
```

### Vite Config

```js
// vite.config.js
import entriesBuildCache from 'vite-plugin-entries-build-cache'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    entriesBuildCache({
      entryRootPath: resolve(process.cwd(), './src/pages'), // 多入口文件夹的父级绝对路径。该插件将会根据该路径下的文件变动，对输入的打包入口进行过滤
      rootPath: process.cwd(), // 项目根目录绝对路径
      exclude: ['.gitignore', 'package-lock.json']
    })
  ],
  build: {
    emptyOutDir: false, // 该配置需为 false
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), './src/pages/index/index.html'),
        about: resolve(process.cwd(), './src/pages/about/index.html')
      }
    }
  }
})
```

### 修改代码

1. 当编辑 `entryRootPath` 即 `./src/pages` 下的文件时，将会触发过滤机制：

```bash
modified:   src/pages/about/index.html
```

构建时，将会只打包变动目录下的入口， 即`about` 入口，相当于：

```text
input: {
  about: resolve(process.cwd(), './src/pages/about/index.html')
}
```

2. 当编辑 `rootPath` 内，但不在 `entryRootPath` 内的文件时，将不会触发过滤机制：

```bash
modified:   vite.config.js
```

构建时，将会打包所有入口文件，因为插件无法确定变动会影响到哪些入口文件：

```text
input: {
  index: resolve(process.cwd(), './src/pages/index/index.html'),
  about: resolve(process.cwd(), './src/pages/about/index.html')
}
```








