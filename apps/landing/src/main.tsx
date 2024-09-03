import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import './i18n/config'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import reportWebVitals from './reportWebVitals'
import Landing from './pages/Landing'
import ConfigProvider from './context/config/context'
import Blog from './pages/Blog'

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Landing />
          } />
          <Route path="/blog" element={
            <Blog />
          } />
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
