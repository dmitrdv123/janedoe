import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import './i18n/config' // Assuming i18n is properly configured in this file

import reportWebVitals from './reportWebVitals'
import Landing from './pages/Landing'
import ConfigProvider from './context/config/context'
import Blog from './pages/Blog'
import LanguageWrapper from './components/LanguageWrapper'
import Loader from './components/Loader'

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <HelmetProvider>
        <BrowserRouter>
          <Routes>
            <Route path={`/:lang?`} element={<LanguageWrapper element={
              <Suspense fallback={<Loader />}>
                <Landing />
              </Suspense>
            } />} />
            <Route path="/:lang?/blog" element={<LanguageWrapper element={
              <Suspense fallback={<Loader />}>
                <Blog />
              </Suspense>
            } />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </HelmetProvider>
    </ConfigProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
