import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function UrlList() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(false)
  // Normalize API base (similar logic to UrlShortener)
  const ENV_API = import.meta.env.VITE_API_BASE
  const normalizeEnvApi = (val) => {
    if (!val) return null
    const t = String(val).trim()
    if (t === '') return null
    if (/^https?:\/\//i.test(t)) return t.replace(/\/+$/, '')
    if (t.startsWith('/')) return t.replace(/\/+$/, '')
    if (/^[\w.-]+(:\d+)?$/.test(t)) {
      const scheme = import.meta.env.PROD ? 'https://' : 'http://'
      return (scheme + t).replace(/\/+$/, '')
    }
    return t.replace(/\/+$/, '')
  }

  const normalized = normalizeEnvApi(ENV_API)
  let API_BASE
  if (!normalized) {
    API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'
  } else if (normalized.startsWith('/')) {
    API_BASE = normalized
  } else {
    API_BASE = normalized.endsWith('/api') ? normalized : normalized + '/api'
  }

  const DISPLAY_ROOT = API_BASE.startsWith('http') ? API_BASE.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : '')

  useEffect(() => {
    fetchList()
  }, [])

  const fetchList = async () => {
    try {
      setLoading(true)
  const res = await axios.get(`${API_BASE}/urls?page=1&limit=50`)
      // sort by clicks desc
      const data = (res.data.data || []).sort((a,b) => (b.clicks||0) - (a.clicks||0))
      setUrls(data)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const del = async (code) => {
    if (!confirm('Delete this short URL?')) return
    try {
  await axios.delete(`${API_BASE}/urls/${code}`)
      toast.success('Deleted')
      fetchList()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shortened URLs</h2>
      {loading ? (
        <div>Loading…</div>
      ) : urls.length === 0 ? (
        <div className="text-gray-600">No shortened URLs yet. Create one from the Shorten page.</div>
      ) : (
        <div className="space-y-3">
          {urls.map(u => (
            <div key={u._id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{u.originalUrl}</div>
                <div className="text-sm text-gray-600">Short: <a className="text-blue-600" href={`${DISPLAY_ROOT}/${u.shortCode}`} target="_blank" rel="noreferrer">{DISPLAY_ROOT}/{u.shortCode}</a></div>
                <div className="text-sm text-gray-600">Clicks: {u.clicks} • Created: {new Date(u.createdAt).toLocaleString()}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => { navigator.clipboard?.writeText(`${DISPLAY_ROOT}/${u.shortCode}`).then(()=>toast.success('Copied')).catch(()=>toast.error('Copy failed')) }} className="px-3 py-1 bg-gray-200 rounded">Copy</button>
                <button onClick={() => del(u.shortCode)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
