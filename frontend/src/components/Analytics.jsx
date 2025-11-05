import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function Analytics() {
  const [shortCode, setShortCode] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
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

  const fetch = async () => {
    if (!shortCode) return
    try {
      setLoading(true)
  const res = await axios.get(`${API_BASE}/urls/${shortCode}/analytics`)
      setData(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
    finally { setLoading(false) }
  }

  const timeseriesToArray = (timeseries) => {
    return Object.entries(timeseries || {}).map(([date, count]) => ({ date, count }))
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="mb-4 flex gap-2">
        <input placeholder="shortCode or alias" value={shortCode} onChange={e => setShortCode(e.target.value)} className="border p-2" />
        <button onClick={fetch} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded">{loading ? 'Loading…' : 'Fetch'}</button>
      </div>

      {data ? (
        <div>
          <div className="mb-4">Total clicks: {data.clicks}</div>

          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={timeseriesToArray(data.timeseries)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <h3 className="mt-4 mb-2 font-semibold">Recent clicks</h3>
          <div className="space-y-2">
            {(data.recent || []).map((c, i) => (
              <div key={i} className="p-2 border rounded">
                <div>{new Date(c.clickedAt).toLocaleString()}</div>
                <div className="text-sm text-gray-600">IP: {c.ipAddress} • UA: {c.userAgent}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">No analytics loaded. Enter a shortCode and click Fetch.</div>
      )}
    </div>
  )
}
