import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import './i18n/config' // Assuming i18n is properly configured in this file

import reportWebVitals from './reportWebVitals'
import Landing from './pages/Landing'
import ConfigProvider from './context/config/context'
import Blog from './pages/Blog'
import LanguageWrapper from './components/LanguageWrapper'

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path={`/:lang?`} element={<LanguageWrapper element={<Landing />} />} />
          <Route path="/:lang?/blog" element={<LanguageWrapper element={<Blog />} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
