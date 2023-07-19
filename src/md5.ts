import fs from 'fs-extra'
import fg from 'fast-glob'
import crypto from 'crypto'
import path from 'path'
import Log from './log'

export interface IUseMd5Options {
  cachePath: string
  rootPath: string
  exclude?: string[]
  entryRootPath?: string
}

enum FileType {
  pub = 'pub',
  entries = 'entries'
}

export type IMd5Result = {
  [key in keyof typeof FileType]: {
    add: string[]
    del: string[]
    edit: string[]
    isChanged: boolean
  }
}

export const useMD5 = async ({ cachePath, rootPath, exclude = [], entryRootPath }: IUseMd5Options) => {
  const md5sPath = `${cachePath}/.md5s.json`
  fs.ensureFileSync(md5sPath)
  const publicPath = path.resolve(rootPath)
  const entryPath = entryRootPath ? path.resolve(rootPath, entryRootPath) : null

  // old md5 json
  const oldMd5s: Record<FileType, Record<string, string>> = JSON.parse(fs.readFileSync(md5sPath, 'utf-8') || JSON.stringify({ [FileType.pub]: {}, [FileType.entries]: {} }))

  exclude.push(`${entryRootPath}/**/*` || '')
  const publicMd5s = await handlePublic({ publicPath, exclude })
  const entryMd5s = entryPath ? await handleEntry({ entryPath }) : {}

  // new md5 json
  const newMd5s = { pub: publicMd5s, entries: entryMd5s }

  return { diff: () => diff({ newMd5s, oldMd5s }), writeMD5JSON: () => writeMD5JSON(md5sPath, newMd5s) }
}

async function writeMD5JSON(path: string, data: Record<string, unknown>) {
  await fs.promises.writeFile(path, JSON.stringify(data, null, 2))
  Log.getInstance().success(`MD5s saved to ${path}`)
}

// core: diff md5 json
function diff({ newMd5s, oldMd5s }: Record<'newMd5s' | 'oldMd5s', Record<FileType, Record<string, string>>>) {
  const result: IMd5Result = {
    [FileType.pub]: {
      add: [],
      del: [],
      edit: [],
      isChanged: false,
    },
    [FileType.entries]: {
      add: [],
      del: [],
      edit: [],
      isChanged: false,
    },
  }
  const { [FileType.pub]: publicMd5s, [FileType.entries]: entryMd5s } = newMd5s
  const { [FileType.pub]: oldPublicMd5s, [FileType.entries]: oldEntriesMd5s } = oldMd5s

  for (const file in oldPublicMd5s) {
    if (publicMd5s[file]) {
      // public: edit
      if (oldPublicMd5s[file] !== publicMd5s[file]) {
        result[FileType.pub].edit.push(file)
      }
    } else {
      // public: del
      result[FileType.pub].del.push(file)
    }
  }
  for (const file in publicMd5s) {
    if (!oldPublicMd5s[file]) {
      // public: add
      result[FileType.pub].add.push(file)
    }
  }
  for (const folder in oldEntriesMd5s) {
    if (entryMd5s[folder]) {
      // entry: edit
      if (oldEntriesMd5s[folder] !== entryMd5s[folder]) {
        result[FileType.entries].edit.push(folder)
      }
    } else {
      // entry: del
      result[FileType.entries].del.push(folder)
    }
  }
  for (const folder in entryMd5s) {
    if (!oldEntriesMd5s[folder]) {
      // entry: add
      result[FileType.entries].add.push(folder)
    }
  }
  return checkIsChanged(result)
}

function checkIsChanged(result: IMd5Result): IMd5Result {
  for (const key of Object.keys(result)) {
    const value = result[key as FileType]
    if (value.add.length > 0 || value.del.length > 0 || value.edit.length > 0) {
      value.isChanged = true
    }
  }
  return result
}

async function getFileMd5(filePath: string): Promise<string> {
  const hash = crypto.createHash('md5')
  const fileStream = fs.createReadStream(filePath)
  for await (const chunk of fileStream) {
    hash.update(chunk)
  }
  return hash.digest('hex')
}

async function getFolderMd5(folderPath: string): Promise<string> {
  const hash = crypto.createHash('md5')
  const readDir = await fs.promises.readdir(folderPath)
  for (const file of readDir) {
    const filePath = path.join(folderPath, file)
    const stat = await fs.promises.stat(filePath)
    if (stat.isDirectory()) {
      hash.update(file)
      const subFolderMd5 = await getFolderMd5(filePath)
      hash.update(subFolderMd5)
    } else {
      const fileMd5 = await getFileMd5(filePath)
      hash.update(fileMd5)
    }
  }
  return hash.digest('hex')
}

// calculate the MD5 of all files under publicPath
async function handlePublic({ publicPath, exclude = [] }: { publicPath: string; exclude: string[] }) {
  const publicMd5s: Record<string, string> = {}
  const publicFiles = await fg(['**/*'], {
    cwd: publicPath,
    ignore: exclude,
    onlyFiles: true,
    absolute: true,
  })

  const md5Promises = publicFiles.map(async (file) => {
    const md5 = await getFileMd5(file)
    publicMd5s[file] = md5
  })
  await Promise.all(md5Promises)
  return publicMd5s
}

// calculate the MD5 of all first-level folders under entryPath
async function handleEntry({ entryPath }: { entryPath: string }) {
  const entryMd5s: Record<string, string> = {}
  const entryFolders = await fg(['*'], {
    cwd: entryPath,
    onlyDirectories: true,
    absolute: true,
  })
  const md5Promises = entryFolders.map(async (folder) => {
    const md5 = await getFolderMd5(folder)
    entryMd5s[folder] = md5
  })
  await Promise.all(md5Promises)
  return entryMd5s
}
