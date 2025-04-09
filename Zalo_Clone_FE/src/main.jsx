import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ZaloLogin from './ZaloLogin.jsx'
import ZaloRegister from './ZaloRegister.jsx'
import { Link } from 'react-router-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
  <StrictMode>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ZaloLogin />} />
      <Route path="/register" element={<ZaloRegister />} />
    </Routes>
  </BrowserRouter>
</StrictMode>
)
