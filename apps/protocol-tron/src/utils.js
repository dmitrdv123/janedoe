const fs = require('fs')
const path = require('path')

async function saveFile(dir, file, data) {
  const fullDir = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullDir)) {
    await fs.promises.mkdir(dir, { recursive: true })
  }

  const filePath = path.join(fullDir, file)
  const str = JSON.stringify(data, (_key, value) => typeof value === 'bigint' ? value.toString() : value)
  await fs.promises.writeFile(filePath, str)
}

async function loadFile(file) {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    return undefined
  }

  return await fs.promises.readFile(filePath, 'utf-8')
}

async function loadFileAsJson(file) {
  const data = await loadFile(file)
  return data === undefined ? undefined : JSON.parse(data)
}

module.exports = {
  saveFile,
  loadFile,
  loadFileAsJson
}