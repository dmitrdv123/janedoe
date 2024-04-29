const fs = require('fs')
const path = require('path')

const { DEPLOYMENTS_FOLDER } = require('./constants')

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

async function saveDeployments(deployment) {
  const deploymentFile = `${deployment.blockchain.toLocaleLowerCase()}.json`
  await saveFile(DEPLOYMENTS_FOLDER, deploymentFile, deployment)
}

async function loadDeployments(blockchain) {
  const deploymentFile = `${DEPLOYMENTS_FOLDER}/${blockchain.toLocaleLowerCase()}.json`
  const deployment = await loadFileAsJson(deploymentFile)
  if (!deployment) {
    throw new Error(`Cannot find file ${deploymentFile}`)
  }

  return deployment
}

module.exports = {
  saveFile,
  loadFile,
  loadFileAsJson,
  saveDeployments,
  loadDeployments
}