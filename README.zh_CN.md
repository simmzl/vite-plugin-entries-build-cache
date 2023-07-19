# vite-plugin-entries-build-cache

[English](./README.md) | 简体中文 

`vite-plugin-entries-build-cache` 是一个 `Vite` 插件，它提供了一个缓存机制，用于加速多入口构建过程。该插件通过校验项目文件变动，对输入的打包入口进行过滤，从而减少构建时间。

注意：该插件仅适用于多入口项目，且仅在`vite` 配置中的 `build.emptyOutDir`需要为 `false`时生效。

## 安装

```bash
npm i vite-plugin-entries-build-cache -D
```

```bash
yarn add vite-plugin-entries-build-cache -D
```

## 使用

要使用 vite-plugin-entries-build-cache，你需要将它作为 Vite 插件来注册。以下是一个示例：

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
| `rootPath?: string` | `process.cwd()` | 项目根目录路径     |
| `exclude?: string[]` | `[]` | 需要额外排除的文件列表，`.gitignore`内的数据将一直被包含 |
| `removeDeletedFiles?: boolean` | `false` | 是否删除标记为删除的文件 |
| `debug?: boolean` | `false` | 是否显示调试日志 |

