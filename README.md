# vite-plugin-entries-build-cache

English | [简体中文](./README.zh_CN.md)

`vite-plugin-entries-build-cache` is a `Vite` plugin that provides a cache mechanism to filter the input package entry based on the verification of project file changes to speed up the multi-entry build process.

Note: This plugin is only applicable to multi-entry projects and only takes effect when `build.emptyOutDir` in the vite configuration needs to be `false`.

## Installation

```bash
npm i vite-plugin-entries-build-cache -D
```

```bash
yarn add vite-plugin-entries-build-cache -D
```

## Usage

Register it as a Vite plugin:

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

## Configuration

| Parameter Name: Type           | Default Value   | Description                                                   |
| ------------------------------ | --------------- | ------------------------------------------------------------- |
| `entryRootPath: string`        | -               | The parent folder path of the multi-entry folder              |
| `rootPath?: string`            | `process.cwd()` | Project root path                                             |
| `exclude?: string[]`           | `[]`            | Additional exclude files, .gitignore data will always be used |
| `debug?: boolean`              | `false`         | Whether to show debug logs                                    |

Attention: Correctly configuring the `exclude` parameter can effectively reduce the file diff time. Because the plugin is diffing all files under `rootPath`, not relying on `git`, so if there are a large number of files under `rootPath` and these files will not affect the entry files, such as `package-lock.json`, then these files can be configured to `exclude` to reduce diff time.

## Example

### Project Structure

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
      entryRootPath: resolve(process.cwd(), './src/pages'), // The parent folder path of the multi-entry folder. The plugin will filter the input entry based on the file changes under this path
      rootPath: process.cwd(), // Project root path
      exclude: ['.gitignore', 'package-lock.json']
    })
  ],
  build: {
    emptyOutDir: false, // This configuration needs to be false
    rollupOptions: {
      input: {
        index: resolve(process.cwd(), './src/pages/index/index.html'),
        about: resolve(process.cwd(), './src/pages/about/index.html')
      }
    }
  }
})
```

### Modify Code

1. When editing the file under `entryRootPath` that is `./src/pages`, the filter mechanism will be triggered:

```bash
modified:   src/pages/about/index.html
```

When building, only the entry under the changed directory will be packaged, that is, the `about` entry, which is equivalent to:


```text
input: {
  about: resolve(process.cwd(), './src/pages/about/index.html')
}
```

1. When editing the file in `rootPath`, but not in `entryRootPath`, the filter mechanism will not be triggered:

```bash
modified:   vite.config.js
```

When building, all entry files will be packaged, because the plugin cannot determine which entry files will be affected by the changes:

```text
input: {
  index: resolve(process.cwd(), './src/pages/index/index.html'),
  about: resolve(process.cwd(), './src/pages/about/index.html')
}
```
