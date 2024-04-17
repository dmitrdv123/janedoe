import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import './i18n/config'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import reportWebVitals from './reportWebVitals'
import store from './states/store'
import Support from './pages/Support'
import ConfigProvider from './context/config/context'

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <ConfigProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <Support />
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
