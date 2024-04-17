import * as fs from 'fs'
import * as path from 'path'

export function envName(): string {
  return env('NODE_ENV', 'development')
}

export function env(name: string, defaultValue: string = ''): string {
  return process.env[name]?.trim() ?? defaultValue
}

export function withEnv(name: string, separator: string = '_'): string {
  return [envName(), name].join(separator)
}

export async function loadFile(file: string): Promise<string | undefined> {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    return undefined
  }

  return await fs.promises.readFile(filePath, 'utf-8')
}

export async function loadFileAsJson<T>(file: string): Promise<T | undefined> {
  const data = await loadFile(file)
  return data === undefined ? undefined : JSON.parse(data)
}
