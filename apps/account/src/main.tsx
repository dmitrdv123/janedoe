import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Transport } from 'viem'
import { WagmiProvider } from 'wagmi'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import './i18n/config'

import reportWebVitals from './reportWebVitals'
import store from './states/store'
import Auth from './pages/Auth'
import AuthGuard from './components/Guards/AuthGuard'
import Accounts from './pages/Accounts'
import Loader from './components/Loader'
import Main from './pages/Sandbox/Main'
import ConfigProvider from './context/config/context'
import { getTransport } from './libs/utils'
import { CHAINS } from './constants'
import { ApplicationPage } from './types/page'
import App from './pages/App'
import Home from './components/Home'
import Balances from './components/Balances'
import AccountSettings from './components/AccountSettings'
import Payments from './components/Payments'
import Payment from './components/Payment'
import PaymentSettings from './components/PaymentSettings'
import AccountSupport from './components/AccountSupport'

if (!import.meta.env.VITE_APP_PROJECT_ID) {
  throw new Error('You need to provide VITE_APP_PROJECT_ID env variable')
}

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_APP_PROJECT_ID

// 2. Create wagmiConfig
const metadata = {
  name: 'janedoe',
  description: 'JaneDoe Account',
  url: 'https://account.janedoe.fi', // origin must match your domain & subdomain
  icons: []
}

const transports: { [key: number]: Transport } = CHAINS.reduce((acc, chain) => {
  acc[chain.id] = getTransport(chain.id, projectId)
  return acc
}, {} as { [key: number]: Transport })

const wagmiConfig = defaultWagmiConfig({
  projectId,
  metadata,
  transports,
  chains: CHAINS,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  enableWalletConnect: true,
  auth: {
    email: false,
    socials: undefined,
    showWallets: true,
    walletFeatures: false
  }
})

// 3. Create modal
createWeb3Modal({
  metadata,
  wagmiConfig,
  projectId,
  enableAnalytics: false, // Optional - defaults to your Cloud configuration
})

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <WagmiProvider config={wagmiConfig} reconnectOnMount>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <Auth />
                } />
                <Route path="/app" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.HOME}
                        element={<Home />}
                      />}
                    />
                  </Suspense>
                } />
                <Route path="/app/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.HOME}
                        element={<Home />}
                      />}
                    />
                  </Suspense>
                } />

                <Route path="/balances" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.BALANCES}
                        requiredKeys={['balances']}
                        requiredPermission='View'
                        element={<Balances />}
                      />}
                    />
                  </Suspense>
                } />
                <Route path="/balances/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.BALANCES}
                        requiredKeys={['balances']}
                        requiredPermission='View'
                        element={<Balances />}
                      />}
                    />
                  </Suspense>
                } />

                <Route path="/payment" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.PAYMENT}
                        requiredKeys={['balances']}
                        requiredPermission='Modify'
                        element={<Payment />}
                      />}
                    />
                  </Suspense>
                } />
                <Route path="/payment/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.PAYMENT}
                        requiredKeys={['balances']}
                        requiredPermission='Modify'
                        element={<Payment />}
                      />}
                    />
                  </Suspense>
                } />

                <Route path="/payments" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.PAYMENTS}
                        requiredKeys={['payments']}
                        requiredPermission='View'
                        element={<Payments />}
                      />}
                    />
                  </Suspense>
                } />
                <Route path="/payments/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.PAYMENTS}
                        requiredKeys={['payments']}
                        requiredPermission='View'
                        element={<Payments />}
                      />}
                    />
                  </Suspense>
                } />

                <Route path="/account_settings" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.ACCOUNT_SETTINGS}
                        requiredKeys={['common_settings', 'notification_settings', 'api_settings', 'team_settings']}
                        requiredPermission='View'
                        element={<AccountSettings />}
                      />}
                    />
                  </Suspense>
                } />
                <Route path="/account_settings/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.ACCOUNT_SETTINGS}
                        requiredKeys={['common_settings', 'notification_settings', 'api_settings', 'team_settings']}
                        requiredPermission='View'
                        element={<AccountSettings />}
                      />}
                    />
                  </Suspense>
                } />

                <Route path="/payment_settings" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.PAYMENT_SETTINGS}
                        requiredKeys={['payment_settings']}
                        requiredPermission='View'
                        element={<PaymentSettings />}
                      />}
                    />
                  </Suspense>
                } />
                <Route path="/payment_settings/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.PAYMENT_SETTINGS}
                        requiredKeys={['payment_settings']}
                        requiredPermission='View'
                        element={<PaymentSettings />}
                      />}
                    />
                  </Suspense>
                } />

                <Route path="/support" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.SUPPORT}
                        element={<AccountSupport />}
                      />}
                    />
                  </Suspense>
                } />
                <Route path="/support/:id" element={
                  <Suspense fallback={<Loader />}>
                    <AuthGuard element={
                      <App
                        page={ApplicationPage.SUPPORT}
                        element={<AccountSupport />}
                      />}
                    />
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
