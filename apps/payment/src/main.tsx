import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Transport } from 'viem'
import { Chain, arbitrum, avalanche, base, bsc, cronos, hardhat, linea, mainnet, optimism, polygon, zkSync } from 'viem/chains'
import { WagmiProvider, http } from 'wagmi'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import './i18n/config'

import App from './pages/App'
import reportWebVitals from './reportWebVitals'
import store from './states/store'
import NotFound from './pages/NotFound'
import PaymentStatus from './pages/PaymentStatus'
import Loader from './components/Loader'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentEvm from './pages/Sandbox/PaymentEvm'
import PaymentBtc from './pages/Sandbox/PaymentBtc'
import ConfigProvider from './context/config/context'
import { tron } from './types/chains'

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
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: []
}

const chains: [Chain, ...Chain[]] = [
  hardhat, arbitrum, avalanche, base, bsc, cronos, linea, mainnet, optimism, polygon, tron, zkSync
]
const transports: {[key: number]: Transport} = {
  [arbitrum.id]: http(),
  [avalanche.id]: http(),
  [base.id]: http(),
  [bsc.id]: http(),
  [cronos.id]: http(),
  [linea.id]: http(),
  [mainnet.id]: http(),
  [optimism.id]: http(),
  [polygon.id]: http(),
  [tron.id]: http(),
  [zkSync.id]: http()
}

if (import.meta.env.VITE_APP_IS_DEV) {
  chains.push(hardhat)
  transports[hardhat.id] = http()
}

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports
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
                <Route path="/:id/:paymentId/:currency/:amount" element={
                  <Suspense fallback={<Loader />}>
                    <App />
                  </Suspense>
                } />
                <Route path="/success/:id/:paymentId/:currency/:amount" element={
                  <Suspense fallback={<Loader />}>
                    <PaymentSuccess />
                  </Suspense>
                } />
                <Route path="/status/:id/:paymentId/:currency/:amount" element={
                  <Suspense fallback={<Loader />}>
                    <PaymentStatus />
                  </Suspense>
                } />
                {import.meta.env.VITE_APP_IS_DEV && (
                  <>
                    <Route path="/sandbox/payment/evm" element={
                      <Suspense fallback={<Loader />}>
                        <PaymentEvm />
                      </Suspense>
                    } />
                    <Route path="/sandbox/payment/btc" element={
                      <Suspense fallback={<Loader />}>
                        <PaymentBtc />
                      </Suspense>
                    } />
                    <Route path="*" element={
                      <Suspense fallback={<Loader />}>
                        <NotFound />
                      </Suspense>
                    } />
                  </>
                )}
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
