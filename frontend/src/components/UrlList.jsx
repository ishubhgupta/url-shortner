import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function UrlList() {
  const [urls, setUrls] = useState([])
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

  useEffect(() => {
    fetchList()
  }, [])

  const fetchList = async () => {
    const res = await axios.get(`${BASE}/api/urls?page=1&limit=50`)
    setUrls(res.data.data)
  }

  const del = async (code) => {
    if (!confirm('Delete this short URL?')) return
    try {
      await axios.delete(`${BASE}/api/urls/${code}`)
      toast.success('Deleted')
      fetchList()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shortened URLs</h2>
      <div className="space-y-3">
        {urls.map(u => (
          <div key={u._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{u.originalUrl}</div>
              <div className="text-sm text-gray-600">Short: <a className="text-blue-600" href={`${BASE}/${u.shortCode}`} target="_blank" rel="noreferrer">{BASE}/{u.shortCode}</a></div>
              <div className="text-sm text-gray-600">Clicks: {u.clicks} • Created: {new Date(u.createdAt).toLocaleString()}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => { navigator.clipboard?.writeText(`${BASE}/${u.shortCode}`); toast.success('Copied'); }} className="px-3 py-1 bg-gray-200 rounded">Copy</button>
              <button onClick={() => del(u.shortCode)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
