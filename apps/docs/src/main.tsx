import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import './i18n/config'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import reportWebVitals from './reportWebVitals'
import Loader from './components/Loader'
import store from './states/store'
import Main from './pages/Sandbox/Main'
import ConfigProvider from './context/config/context'
import LanguageWrapper from './components/LanguageWrapper'
import AppWrapper from './components/AppWrapper'
import Home from './components/Home'
import { ApplicationPage } from './types/page'
import Tutorials from './components/Tutorials'
import CreateAccount from './components/Tutorials/components/CreateAccount'
import ReceivePayments from './components/Tutorials/components/ReceivePayments'
import MonitorPayments from './components/Tutorials/components/MonitorPayments'
import Withdraw from './components/Tutorials/components/Withdraw'
import ShareAccess from './components/Tutorials/components/ShareAccess'
import PaymentSettings from './components/Tutorials/components/PaymentSettings'
import Notifications from './components/Tutorials/components/Notifications'
import Api from './components/Tutorials/components/Api'
import Resources from './components/Resources'
import Currencies from './components/Resources/components/Currencies'
import Blockchains from './components/Resources/components/Blockchains'
import Tokens from './components/Resources/components/Tokens'
import Contracts from './components/Resources/components/Contracts'

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <HelmetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/:lang?" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.HOME}
                    element={<Home />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials/" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS}
                    element={<Tutorials />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_create_account" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_CREATE_ACCOUNT}
                    element={<CreateAccount />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_receive_payments" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_RECEIVE_PAYMENTS}
                    element={<ReceivePayments />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_monitor_payments" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_MONITOR_PAYMENTS}
                    element={<MonitorPayments />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_withdraw" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_WITHDRAW}
                    element={<Withdraw />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_share_access" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_SHARE_ACCESS}
                    element={<ShareAccess />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_payment_settings" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_PAYMENT_SETTINGS}
                    element={<PaymentSettings />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_notifications" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_NOTIFICATIONS}
                    element={<Notifications />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/tutorials_api" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.TUTORIALS_API}
                    element={<Api />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/resources" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.RESOURCES}
                    element={<Resources />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/resources_currencies" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.RESOURCES_CURRENCIES}
                    element={<Currencies />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/resources_blockchains" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.RESOURCES_BLOCKCHAINS}
                    element={<Blockchains />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/resources_tokens" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.RESOURCES_TOKENS}
                    element={<Tokens />}
                  />
                </Suspense>
              } />} />

              <Route path="/:lang?/resources_contracts" element={<LanguageWrapper element={
                <Suspense fallback={<Loader />}>
                  <AppWrapper
                    page={ApplicationPage.RESOURCES_CONTRACTS}
                    element={<Contracts />}
                  />
                </Suspense>
              } />} />

              {import.meta.env.VITE_APP_IS_DEV && (
                <Route path="/:lang?/sandbox/main" element={<LanguageWrapper element={
                  <Suspense fallback={<Loader />}>
                    <Main />
                  </Suspense>
                } />} />
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </HelmetProvider>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
