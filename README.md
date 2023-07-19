# vite-plugin-entries-build-cache

English | [简体中文](./README.zh_CN.md)

`vite-plugin-entries-build-cache` is a Vite plugin that provides a caching mechanism to speed up the multi-entry build process. The plugin filters the input entry based on the project file changes, reducing the build time.

Note: This plugin is only applicable to multi-entry projects and only takes effect when `build.emptyOutDir` in the vite configuration needs to be `false`.

## Installation

```bash
npm i vite-plugin-entries-build-cache -D
```

```bash
yarn add vite-plugin-entries-build-cache -D
```

## Usage

To use `vite-plugin-entries-build-cache`, you need to register it as a Vite plugin. Here's an example:

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
| `removeDeletedFiles?: boolean` | `false`         | Whether to delete files marked for deletion                   |
| `debug?: boolean`              | `false`         | Whether to show debug logs                                    |

