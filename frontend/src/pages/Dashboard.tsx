import { useEffect, useState } from 'react'
import { getHealth } from '../api/endpoints'

function Dashboard() {
  const [status, setStatus] = useState('Connecting...')
  const [service, setService] = useState('Evidence Mesh')
  const [version, setVersion] = useState('')

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await getHealth()
        setStatus(response.status)
        setService(response.service)
        setVersion(response.version)
      } catch {
        setStatus('Backend unavailable')
      }
    }
    checkBackend()
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
          Evidence Mesh
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Procurement Intelligence Platform
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          AI-assisted bid compliance verification for GeM procurement.
        </p>
        <div className="mt-8 rounded-xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-slate-400">
            Backend connection
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {status}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {service} {version && `• v${version}`}
          </p>
        </div>
      </section>
    </main>
  )
}

export default Dashboard