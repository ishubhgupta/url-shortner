import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import UrlShortener from './components/UrlShortener'
import UrlList from './components/UrlList'
import Analytics from './components/Analytics'

export default function App() {
  return (
    <div className="p-6 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">URL Shortener</h1>
        <nav className="mt-2">
          <Link to="/" className="mr-4 text-blue-600">Shorten</Link>
          <Link to="/urls" className="mr-4 text-blue-600">URLs</Link>
          <Link to="/analytics" className="text-blue-600">Analytics</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<UrlShortener />} />
          <Route path="/urls" element={<UrlList />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
