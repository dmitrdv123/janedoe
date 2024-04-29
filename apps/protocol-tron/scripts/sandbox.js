require('dotenv').config({ path: `.env.${process.env.NODE_ENV}`.trim() })

const { TronWeb } = require('tronweb')
const WrappedNative = require('../build/contracts/WrappedNative.json')

const tronWeb = new TronWeb({
  fullHost: process.env.RPC,
  privateKey: process.env.SIGNER
})

async function sendMessage() {
  const contractAddress = '418d9c8c9678751004eef8c16c96f77f2f6806cd69'
  const contract = await tronWeb.contract(WrappedNative.abi, contractAddress)
  const symbol = await contract.symbol().call()
  console.log(`WrappedNative symbol: ${symbol}`)
}

sendMessage()