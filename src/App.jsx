import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Portal from './pages/Portal'
import Dashboard from './pages/Dashboard'
import './index.css'
import Privacy from './pages/Legal/Privacy';
import Terms from './pages/Legal/Terms';
import Refund from './pages/Legal/Refund';
import Contact from './pages/Legal/Contact';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/:username" element={<Portal />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}
