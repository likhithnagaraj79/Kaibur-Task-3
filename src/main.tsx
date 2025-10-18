import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'; // 💡 1. Import ConfigProvider
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 💡 2. Wrap App with ConfigProvider */}
    <ConfigProvider> 
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)