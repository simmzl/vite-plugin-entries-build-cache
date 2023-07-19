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

export function copyDir(src: string, dest: string) {
  fs.emptyDirSync(dest)
  fs.mkdirSync(dest, { recursive: true })

  const files = fs.readdirSync(src)

  files.forEach((file) => {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)

    const stats = fs.statSync(srcPath)

    if (stats.isFile()) {
      fs.copyFileSync(srcPath, destPath)
    } else if (stats.isDirectory()) {
      copyDir(srcPath, destPath)
    }
  })
}

export async function mergeDirs(srcDir: string, destDir: string) {
  const srcExists = await fs.pathExists(srcDir)
  const destExists = await fs.pathExists(destDir)
  if (!srcExists) {
    throw new Error(`Source directory ${srcDir} does not exist`)
  }
  if (!destExists) {
    await fs.mkdir(destDir)
  }

  const files = await fs.readdir(srcDir)
  for (const file of files) {
    const srcPath = `${srcDir}/${file}`
    const destPath = `${destDir}/${file}`

    const stat = await fs.stat(srcPath)
    if (stat.isFile()) {
      await fs.copyFile(srcPath, destPath)
    }

    if (stat.isDirectory()) {
      await mergeDirs(srcPath, destPath)
    }
  }
}

export function readGitignore(): string[] {
  const gitignorePath = path.join(process.cwd(), '.gitignore')
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8')
  const gitignoreLines = gitignoreContent.split(/\r?\n/)
  const gitignoreEntries = gitignoreLines.map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
  return gitignoreEntries || []
}
