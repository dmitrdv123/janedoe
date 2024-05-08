import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Transport } from 'viem'
import { Chain, arbitrum, avalanche, base, bsc, cronos, hardhat, linea, mainnet, optimism, polygon, zkSync } from 'viem/chains'
import { WagmiProvider } from 'wagmi'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import './i18n/config'

import App from './pages/App'
import reportWebVitals from './reportWebVitals'
import store from './states/store'
import Auth from './pages/Auth'
import AuthGuard from './components/Guards/AuthGuard'
import Accounts from './pages/Accounts'
import Loader from './components/Loader'
import Main from './pages/Sandbox/Main'
import ConfigProvider from './context/config/context'
import { tron } from './types/chains'
import { getTransport } from './libs/utils'

if (!import.meta.env.VITE_APP_PROJECT_ID) {
  throw new Error('You need to provide VITE_APP_PROJECT_ID env variable')
}

// 0. Setup queryClient for WAGMIv2
const queryClient = new QueryClient()

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_APP_PROJECT_ID

// 2. Create wagmiConfig
const metadata = {
  name: 'janedoe',
  description: 'JaneDoe Account',
  url: 'http://localhost:3002', // origin must match your domain & subdomain
  icons: []
}

const chains: [Chain, ...Chain[]] = [
  arbitrum, avalanche, base, bsc, cronos, linea, mainnet, optimism, polygon, tron, zkSync
]
if (import.meta.env.VITE_APP_IS_DEV) {
  chains.push(hardhat)
}

const transports: {[key: number]: Transport} = chains.reduce((acc, chain) => {
  acc[chain.id] = getTransport(chain.id, projectId)
  return acc
}, {} as {[key: number]: Transport})

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  enableWalletConnect: true,
  enableEmail: false
})

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId })

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>

            <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <Auth />
                } />
                <Route path="/app" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={<App />} />
                  </Suspense>
                } />
                <Route path="/app/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={<App />} />
                  </Suspense>
                } />
                <Route path="/accounts" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={<Accounts />} />
                  </Suspense>
                } />
                {import.meta.env.VITE_APP_IS_DEV && (
                  <>
                    <Route path="/sandbox/main" element={
                      <Main />
                    } />
                  </>
                )}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </WagmiProvider>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
