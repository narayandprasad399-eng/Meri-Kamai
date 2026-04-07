import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Portal from './pages/Portal'
import Dashboard from './pages/Dashboard'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/:username" element={<Portal />} />
      </Routes>
    </BrowserRouter>
  )
}
