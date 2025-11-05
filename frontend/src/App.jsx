import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import UrlShortener from './components/UrlShortener'
import UrlList from './components/UrlList'
import Analytics from './components/Analytics'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-400 rounded flex items-center justify-center text-white font-bold">US</div>
            <div>
              <h1 className="text-2xl font-extrabold">URL Shortener</h1>
              <div className="text-sm text-slate-500">Shorten links, track clicks, and view analytics</div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link to="/" className="px-3 py-2 rounded hover:bg-slate-100">Shorten</Link>
            <Link to="/urls" className="px-3 py-2 rounded hover:bg-slate-100">URLs</Link>
            <Link to="/analytics" className="px-3 py-2 rounded hover:bg-slate-100">Analytics</Link>
          </nav>
        </header>

        <main className="mb-12">
          <Routes>
            <Route path="/" element={<UrlShortener />} />
            <Route path="/urls" element={<UrlList />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>

        <footer className="py-6 text-center text-sm text-slate-500">
          Built with ❤️ — simple URL shortener • Backend running on port 5000
        </footer>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
