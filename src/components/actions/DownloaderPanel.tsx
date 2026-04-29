import { useState, useEffect, useCallback } from 'react'
import type { DownloadJob, ScraperResource } from '../../../shared/electron-api.types'
import { useSettingsStore } from '../../store/settings.store'

function currentTrimester(): number {
  return Math.floor(new Date().getMonth() / 3) + 1
}

function buildScraperUrl(baseUrl: string, type: 'boletim' | 'mordomia'): string {
  const t = currentTrimester()
  const y = new Date().getFullYear()
  const base = baseUrl.replace(/\/?$/, '/')
  if (type === 'boletim') return `${base}boletim-missionario-${t}-o-trimestre-de-${y}`
  return `${base}boletim-de-mordomia-${t}-ot-${y}`
}

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
    const baseUrl = type === 'boletim'
      ? config?.scraperBoletimUrl ?? ''
      : config?.scraperMordomiaUrl ?? ''
    const targetUrl = buildScraperUrl(baseUrl, type)
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

  const inputClass = 'w-full px-3 py-2 border border-app-border bg-app-surface text-app-high rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/50 placeholder:text-app-low'

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Manual URL download */}
      <section>
        <h3 className="text-xs font-semibold text-app-mid uppercase tracking-wider mb-3">Download Manual</h3>
        <div className="space-y-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL (YouTube ou link direto)"
            className={inputClass}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="Nome do ficheiro (ex: video.mp4)"
              className={`flex-1 px-3 py-2 border border-app-border bg-app-surface text-app-high rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/50 placeholder:text-app-low`}
            />
            <button
              onClick={addDownload}
              disabled={!url || !filename}
              className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover text-app-deep rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      </section>

      {/* Queue */}
      {queue.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-app-mid uppercase tracking-wider mb-3">Fila de Downloads</h3>
          <div className="space-y-2">
            {queue.map(job => (
              <div key={job.id} className="border border-app-border rounded-lg p-3 bg-app-surface">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-medium text-app-mid truncate flex-1">{job.filename}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    job.status === 'complete'     ? 'bg-green-900/30 text-green-400' :
                    job.status === 'error'        ? 'bg-red-900/30 text-red-400' :
                    job.status === 'downloading'  ? 'bg-app-accent/20 text-app-accent' :
                    'bg-app-border text-app-low'
                  }`}>
                    {job.status === 'complete' ? 'Concluído' :
                     job.status === 'error' ? 'Erro' :
                     job.status === 'downloading' ? `${job.progress}%` :
                     'Na fila'}
                  </span>
                </div>
                {job.status === 'downloading' && (
                  <div className="w-full bg-app-border rounded-full h-1.5">
                    <div
                      className="bg-app-accent h-1.5 rounded-full transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}
                {job.error && <p className="text-xs text-red-400 mt-1">{job.error}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Adventist resources */}
      <section>
        <h3 className="text-xs font-semibold text-app-mid uppercase tracking-wider mb-3">Recursos Adventistas</h3>
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
        <span className="text-sm font-medium text-app-high">{title}</span>
        <button
          onClick={onLoad}
          disabled={loading}
          className="px-3 py-1 text-xs rounded border border-app-border hover:bg-app-surface text-app-mid disabled:opacity-50 transition-colors"
        >
          {loading ? 'A carregar...' : 'Actualizar lista'}
        </button>
      </div>
      {cacheTime && (
        <p className="text-xs text-app-low mb-2">
          Actualizado: {new Date(cacheTime).toLocaleTimeString('pt-PT')}
        </p>
      )}
      {items.length === 0 && !loading && (
        <p className="text-xs text-app-low">Clica "Actualizar lista" para carregar</p>
      )}
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-app-border last:border-0">
            <span className="flex-1 text-app-mid truncate" title={item.title}>{item.title}</span>
            {item.sizeLabel && <span className="text-app-low flex-shrink-0">{item.sizeLabel}</span>}
            <button
              onClick={() => onDownload(item)}
              className="flex-shrink-0 px-2 py-1 rounded bg-app-accent/10 hover:bg-app-accent/20 text-app-accent font-medium transition-colors"
            >
              ⬇
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
