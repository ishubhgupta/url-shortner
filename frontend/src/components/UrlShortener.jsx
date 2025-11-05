import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function UrlShortener() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  const submit = async (e) => {
    e.preventDefault()
    // basic URL validation
    if (!/^https?:\/\/.+/i.test(originalUrl)) {
      const msg = 'Please enter a valid URL (include http:// or https://)'
      setResult({ error: msg })
      toast.error(msg)
      return
    }

    try {
      setLoading(true)
      const payload = { originalUrl }
      if (customAlias) payload.customAlias = customAlias
      if (expiresAt) payload.expiresAt = expiresAt
      const res = await axios.post(`${BASE}/api/shorten`, payload)
      setResult(res.data.data)
      toast.success('Short URL created')
      // try to copy to clipboard
      try { await navigator.clipboard.writeText(`${BASE}/${res.data.data.shortCode}`); toast.success('Copied to clipboard') } catch (e) {}
    } catch (err) {
      const message = err.response?.data?.message || err.message
      setResult({ error: message })
      toast.error(message)
    } finally {
      setLoading(false)
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
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? 'Creating...' : 'Shorten'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-4 p-3 border bg-gray-50">
          {result.error ? (
            <div className="text-red-600">Error: {result.error}</div>
          ) : (
            <div className="space-y-2">
              <div>Short URL: <a className="text-blue-600" href={`${BASE}/${result.shortCode}`} target="_blank" rel="noreferrer">{BASE}/{result.shortCode}</a></div>
              <div>Created At: {new Date(result.createdAt).toLocaleString()}</div>
              <div>
                <button onClick={() => { navigator.clipboard?.writeText(`${BASE}/${result.shortCode}`).then(()=>toast.success('Copied')).catch(()=>toast.error('Copy failed')) }} className="px-3 py-1 bg-gray-200 rounded">Copy</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
