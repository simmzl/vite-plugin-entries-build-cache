import fs from 'fs-extra'
import path from 'path'
import { InputOption } from 'rollup'

export function deletePaths(paths: string[]) {
  if (paths.length === 0) return
  return Promise.all(paths.map((path) => fs.remove(path)))
}

// Filter out the entries that need to be packaged according to the original input
export function filterInput(input: InputOption, arr: string[]) {
  // Todo: does not consider the case where the input is an array
  const inputObj = typeof input === 'string' ? { main: input } : (input as { [entryAlias: string]: string })
  return Object.keys(inputObj)
    .filter((key) => arr.findIndex((i) => inputObj[key].startsWith(`${i}/`)) > -1)
    .reduce((obj, key) => {
      obj[key] = inputObj[key]
      return obj
    }, {} as { [entryAlias: string]: string })
}

export function isEmptyInput(input: InputOption) {
  if (typeof input === 'string' && input.trim() === '') {
    return true
  } else if (Array.isArray(input) && input.length === 0) {
    return true
  } else if (typeof input === 'object' && Object.keys(input).length === 0) {
    return true
  } else {
    return !input
  }
}

export function readGitignore(): string[] {
  const gitignorePath = path.join(process.cwd(), '.gitignore')
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
  const gitignoreLines = gitignoreContent.split(/\r?\n/)
  const gitignoreEntries = gitignoreLines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((entry) => entry.startsWith('/') ? `.${entry}` : entry)
  return gitignoreEntries || []
}