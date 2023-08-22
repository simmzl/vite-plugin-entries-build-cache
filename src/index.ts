import { useMD5 } from './md5'
import { InputOptions } from 'rollup'
import path from 'path'
import { ResolvedConfig } from 'vite'
import { deletePaths, filterInput, isEmptyInput, readGitignore } from './utlis'
import Log from './log'

export interface PluginOptions {
  entryRootPath: string // The parent folder path of the multi-entry folder
  rootPath?: string // Project root path, default is process.cwd()
  exclude?: string[] // Additional exclude files, gitignore data will always be used
  removeDeletedFiles?: boolean // Delete files marked for deletion
  debug?: boolean // Show debug log
}

export default async function starterPlugin(params: PluginOptions) {
  const NAME = "vite-plugin-entries-build-cache"
  const CACHE_DIR = path.resolve(process.cwd(), `node_modules/.cache/${NAME}`)
  const { entryRootPath, exclude = [], removeDeletedFiles = false, rootPath = process.cwd(), debug } = params || {}
  const log = Log.getInstance(NAME, debug)
  
  if (!entryRootPath) log.throwErr('entryRootPath is required!')
  log.debug('params received: ', { entryRootPath, exclude, removeDeletedFiles, rootPath, debug }) 
  const _exclude = [...readGitignore(), ...exclude]
  log.debug('exclude: ', _exclude)

  log.time('diff time')
  const { diff, writeMD5JSON } = await useMD5({ cachePath: CACHE_DIR, entryRootPath, exclude: _exclude, rootPath })
  const { pub, entries } = diff()
  const { add, edit, del, isChanged } = entries
  log.timeEnd('diff time')
  log.debug("diff", { pub, entries })

  // Vite build.emptyOutDir
  let _emptyOutDir = false
  // Vite build.outDir
  let _outDir = ''

  return {
    name: NAME,

    config() {
      console.time('build time')
    },

    // Vite hook
    configResolved(resolvedConfig: ResolvedConfig) {
      const {
        build: { outDir, emptyOutDir },
      } = resolvedConfig
      _emptyOutDir = !!emptyOutDir
      _outDir = outDir
      if (_emptyOutDir) log.warn("The vite option 'emptyOutDir: true' is not supported, please set it to false")
    },

    async options(options: InputOptions) {
      // If there is a change in the public file, return options directly
      if (pub.isChanged) return options
      // If there is no change, return options directly
      if (!isChanged) {
        log.warn("No file changes were detected, but a rebuild will be forced.")
        // log.throwErr('No file changes detected, so no build required.')
        return options
      }

      const { input } = options
      if (!input) log.throwErr('The input option is required.')
      let newInput = filterInput(input!, [...add, ...edit])

      if (isEmptyInput(newInput)) {
        // When the input is empty, and the del file is not empty, select the first file in the original input as the input to continue building
        if (del.length > 0) {
          if (typeof input === 'object') {
            const [key, value] = Object.entries(input)[0]
            newInput = { [key]: value }
          }
          log.warn("No file edits were detected, but there were deletions, so the first file in the original input was selected as input to continue building")
        }
      }

      log.debug("newInput", newInput)

      return { ...options, input: newInput }
    },

    async closeBundle() {
      // if (removeDeletedFiles && entryRootPath) await deletePaths(del.map((i) => path.join(_outDir, i.replace(entryRootPath, ''))))
      await writeMD5JSON()
      console.timeEnd('build time')
    },
  }
}
