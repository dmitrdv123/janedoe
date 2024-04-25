const { TronWeb } = require('tronweb')
const WrappedNative = require('../build/contracts/WrappedNative.json')

const tronWeb = new TronWeb({
  fullHost: 'http://127.0.0.1:9090',
  privateKey: 'a0dbe220a910eaa05a5e038058515ddf977ad3496e82ebd49dc702e305439d8f'
});

async function sendMessage() {
  const contractAddress = '4137b3ec9db66550a884008d8268ae1ef9de79e071'
  const contract = await tronWeb.contract(WrappedNative.abi, contractAddress)
  const symbol = await contract.symbol().call()
  console.log(`WrappedNative symbol: ${symbol}`)
}

sendMessage()