import { useState, useEffect, useCallback } from 'react'
import type { DownloadJob, ScraperResource } from '../../../shared/electron-api.types'
import { useSettingsStore } from '../../store/settings.store'

export function DownloaderPanel() {
  const { config } = useSettingsStore()
  const [url, setUrl] = useState('')
  const [filename, setFilename] = useState('')
  const [queue, setQueue] = useState<DownloadJob[]>([])
  const [boletimList, setBoletimList] = useState<ScraperResource[]>([])
  const [mordomiaList, setMordomiaList] = useState<ScraperResource[]>([])
  const [scraperLoading, setScraperLoading] = useState<'boletim' | 'mordomia' | null>(null)
  const [cacheInfo, setCacheInfo] = useState<{ boletim?: number; mordomia?: number }>({})

  const refreshQueue = useCallback(async () => {
    const q = await window.electronAPI.downloader.listQueue()
    setQueue(q)
  }, [])

  useEffect(() => {
    refreshQueue()
    const unsubProgress = window.electronAPI.downloader.onProgress((job) => {
      setQueue(q => q.map(j => j.id === job.id ? job : j))
    })
    const unsubComplete = window.electronAPI.downloader.onComplete(() => refreshQueue())
    const unsubError    = window.electronAPI.downloader.onError(() => refreshQueue())
    return () => { unsubProgress(); unsubComplete(); unsubError() }
  }, [refreshQueue])

  const addDownload = async () => {
    if (!url || !filename) return
    await window.electronAPI.downloader.start(url, filename)
    setUrl('')
    setFilename('')
    refreshQueue()
  }

  const loadScraper = async (type: 'boletim' | 'mordomia') => {
    setScraperLoading(type)
    const targetUrl = type === 'boletim'
      ? config?.scraperBoletimUrl ?? ''
      : config?.scraperMordomiaUrl ?? ''
    try {
      const items = await window.electronAPI.scraper.fetch(targetUrl)
      if (type === 'boletim') { setBoletimList(items); setCacheInfo(c => ({ ...c, boletim: Date.now() })) }
      else                    { setMordomiaList(items); setCacheInfo(c => ({ ...c, mordomia: Date.now() })) }
    } catch (e) {
      alert(`Erro ao carregar lista: ${e}`)
    } finally {
      setScraperLoading(null)
    }
  }

  const downloadResource = (res: ScraperResource) => {
    const fname = res.title.replace(/[/\\?%*:|"<>]/g, '-') + '.mp4'
    window.electronAPI.downloader.start(res.url, fname)
    refreshQueue()
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Manual URL download */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Download Manual</h3>
        <div className="space-y-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL (YouTube ou link direto)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="Nome do ficheiro (ex: video.mp4)"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addDownload}
              disabled={!url || !filename}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      {/* Queue */}
      {queue.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fila de Downloads</h3>
          <div className="space-y-2">
            {queue.map(job => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-medium text-gray-700 truncate flex-1">{job.filename}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    job.status === 'complete'     ? 'bg-green-100 text-green-700' :
                    job.status === 'error'        ? 'bg-red-100 text-red-700' :
                    job.status === 'downloading'  ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {job.status === 'complete' ? 'Concluído' :
                     job.status === 'error' ? 'Erro' :
                     job.status === 'downloading' ? `${job.progress}%` :
                     'Na fila'}
                  </span>
                </div>
                {job.status === 'downloading' && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}
                {job.error && <p className="text-xs text-red-500 mt-1">{job.error}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Adventist resources */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recursos Adventistas</h3>
        <div className="space-y-4">
          <ResourceList
            title="Boletim Missionário"
            items={boletimList}
            loading={scraperLoading === 'boletim'}
            onLoad={() => loadScraper('boletim')}
            onDownload={downloadResource}
            cacheTime={cacheInfo.boletim}
          />
          <ResourceList
            title="Vídeo Mordomia"
            items={mordomiaList}
            loading={scraperLoading === 'mordomia'}
            onLoad={() => loadScraper('mordomia')}
            onDownload={downloadResource}
            cacheTime={cacheInfo.mordomia}
          />
        </div>
      </section>
    </div>
  )
}

interface ResourceListProps {
  title: string
  items: ScraperResource[]
  loading: boolean
  onLoad: () => void
  onDownload: (res: ScraperResource) => void
  cacheTime?: number
}

function ResourceList({ title, items, loading, onLoad, onDownload, cacheTime }: ResourceListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <button
          onClick={onLoad}
          disabled={loading}
          className="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
        >
          {loading ? 'A carregar...' : 'Actualizar lista'}
        </button>
      </div>
      {cacheTime && (
        <p className="text-xs text-gray-400 mb-2">
          Actualizado: {new Date(cacheTime).toLocaleTimeString('pt-PT')}
        </p>
      )}
      {items.length === 0 && !loading && (
        <p className="text-xs text-gray-400">Clica "Actualizar lista" para carregar</p>
      )}
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-gray-100 last:border-0">
            <span className="flex-1 text-gray-700 truncate" title={item.title}>{item.title}</span>
            {item.sizeLabel && <span className="text-gray-400 flex-shrink-0">{item.sizeLabel}</span>}
            <button
              onClick={() => onDownload(item)}
              className="flex-shrink-0 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium"
            >
              ⬇
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
