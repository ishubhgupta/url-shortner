import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function UrlShortener() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [result, setResult] = useState(null)
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = { originalUrl }
      if (customAlias) payload.customAlias = customAlias
      if (expiresAt) payload.expiresAt = expiresAt
      const res = await axios.post(`${BASE}/api/shorten`, payload)
      setResult(res.data.data)
      toast.success('Short URL created')
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setResult({ error: message })
      toast.error(message)
    }
  }

  return (
    <div className="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Original URL</label>
          <input className="w-full border p-2" value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} placeholder="https://example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium">Custom Alias (optional)</label>
          <input className="w-full border p-2" value={customAlias} onChange={e => setCustomAlias(e.target.value)} placeholder="myalias" />
        </div>

        <div>
          <label className="block text-sm font-medium">Expires At (optional)</label>
          <input type="datetime-local" className="w-full border p-2" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
        </div>

        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Shorten</button>
        </div>
      </form>

      {result && (
        <div className="mt-4 p-3 border bg-gray-50">
          {result.error ? (
            <div className="text-red-600">Error: {result.error}</div>
          ) : (
            <div>
              <div>Short URL: <a className="text-blue-600" href={`${BASE}/${result.shortCode}`} target="_blank" rel="noreferrer">{BASE}/{result.shortCode}</a></div>
              <div>Created At: {result.createdAt}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
