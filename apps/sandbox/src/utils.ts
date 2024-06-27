import * as fs from 'fs'
import path from 'path'

export async function saveFile<T>(dir: string, file: string, data: T): Promise<void> {
  const fullDir = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullDir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }

  const filePath = path.join(fullDir, file)

  const str = JSON.stringify(data, (_key, value) => typeof value === 'bigint' ? value.toString() : value)
  await fs.promises.writeFile(filePath, str)
}

export async function loadFile<T>(file: string): Promise<T | undefined> {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    return undefined
  }

  const data = await fs.promises.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}
