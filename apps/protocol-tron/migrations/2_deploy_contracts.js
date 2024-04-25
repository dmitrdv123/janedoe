const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const { saveDeployment } = require('../src/utils')

const WrappedNative = artifacts.require('./WrappedNative.sol')
const JaneDoe = artifacts.require('./JaneDoe.sol')
const RangoReceiver = artifacts.require('./RangoReceiver.sol')

module.exports = async function (deployer) {
  try {
    deployer.trufflePlugin = true

    const nativeName = `${deployer.network.toLocaleUpperCase()}_NATIVE_NAME`
    const nativeNameValue = process.env[nativeName]
    if (!nativeNameValue) {
      throw new Error(`${nativeName} is not set as env var`)
    }

    const nativeSymbol = `${deployer.network.toLocaleUpperCase()}_NATIVE_SYMBOL`
    const nativeSymbolValue = process.env[nativeSymbol]
    if (!nativeSymbolValue) {
      throw new Error(`${nativeName} is not set as env var`)
    }

    const nativeDecimals = `${deployer.network.toLocaleUpperCase()}_NATIVE_DECIMALS`
    const nativeDecimalsValueStr = process.env[nativeDecimals]
    if (!nativeDecimalsValueStr) {
      throw new Error(`${nativeName} is not set as env var`)
    }
    const nativeDecimalsValue = parseInt(nativeDecimalsValueStr)

    const wrappedNative = await deployProxy(WrappedNative, [nativeNameValue, nativeSymbolValue, nativeDecimalsValue], { deployer, initializer: 'initialize', kind: 'transparent' })
    const janeDoe = await deployProxy(JaneDoe, ['http://localhost', wrappedNative.address], { deployer, initializer: 'initialize', kind: 'transparent' })
    const rangoReceiver = await deployProxy(RangoReceiver, [janeDoe.address], { deployer, initializer: 'initialize', kind: 'transparent' })

    await saveDeployment(janeDoe.address, wrappedNative.address, rangoReceiver.address, deployer.network)
  } catch (error) {
    console.error(error)
  }
}