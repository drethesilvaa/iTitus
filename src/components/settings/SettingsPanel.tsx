import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../store/settings.store'
import { useOBS } from '../../hooks/useOBS'

type SettingsTab = 'obs' | 'paths' | 'ai' | 'scraper' | 'youtube'

function LoginGate({ onUnlock }: { onUnlock: () => void }) {
  const [user, setUser] = useState('')
  const [psw, setPsw] = useState('')
  const [error, setError] = useState(false)

  const attempt = () => {
    if (user === 'admin' && psw === 'admin') {
      onUnlock()
    } else {
      setError(true)
      setPsw('')
    }
  }

  return (
    <div className="h-full flex items-center justify-center bg-app-base">
      <div className="bg-app-surface border border-app-border rounded-xl p-8 w-72 space-y-4">
        <div className="text-center">
          <h2 className="font-bold text-app-high text-base">iTitus AI</h2>
          <p className="text-app-low text-xs mt-1">Acesso restrito</p>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Utilizador"
            value={user}
            onChange={e => { setUser(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={psw}
            onChange={e => { setPsw(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            className={inputClass}
          />
          {error && <p className="text-red-400 text-xs">Credenciais inválidas</p>}
          <button
            onClick={attempt}
            className="w-full py-2 bg-app-accent hover:bg-app-accent-hover text-app-on-accent rounded-lg text-sm font-medium transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  )
}

export function SettingsPanel() {
  const [tab, setTab] = useState<SettingsTab>('obs')
  const [aiUnlocked, setAiUnlocked] = useState(false)
  const { config, updateConfig } = useSettingsStore()
  const obs = useOBS()

  if (!config) return <div className="p-4 text-app-low text-sm">A carregar definições...</div>

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'obs',     label: 'OBS' },
    { id: 'paths',   label: 'Caminhos' },
    { id: 'ai',      label: 'iTitus AI' },
    { id: 'scraper', label: 'Recursos Web' },
    { id: 'youtube', label: 'YouTube' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Tab nav */}
      <div className="flex border-b border-app-border px-4 pt-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id ? 'border-app-accent text-app-accent' : 'border-transparent text-app-low hover:text-app-mid'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'obs'    && <OBSSettings config={config} update={updateConfig} obs={obs} />}
        {tab === 'paths'  && <PathsSettings config={config} update={updateConfig} />}
        {tab === 'ai'     && (aiUnlocked ? <AISettings config={config} update={updateConfig} /> : <LoginGate onUnlock={() => setAiUnlocked(true)} />)}
        {tab === 'scraper' && <ScraperSettings config={config} update={updateConfig} />}
        {tab === 'youtube' && <YouTubeSettings config={config} update={updateConfig} />}
      </div>
    </div>
  )
}

// ── OBS Settings ────────────────────────────────────────────
function OBSSettings({ config, update, obs }: any) {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      await window.electronAPI.obs.connect(config.obsHost, config.obsPort, config.obsPassword)
      setTestResult('success')
    } catch (e) {
      setTestResult(String(e))
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold text-app-high">Ligação ao OBS</h3>
      <Field label="Host">
        <input type="text" value={config.obsHost} onChange={e => update('obsHost', e.target.value)} className={inputClass} />
      </Field>
      <Field label="Porta">
        <input type="number" value={config.obsPort} onChange={e => update('obsPort', parseInt(e.target.value))} className={inputClass} />
      </Field>
      <Field label="Palavra-passe">
        <input
          type="password"
          value={config.obsPassword}
          onChange={e => update('obsPassword', e.target.value)}
          placeholder="Deixar vazio se não configurado"
          className={inputClass}
        />
      </Field>
      <Field label="Ligar automaticamente">
        <input
          type="checkbox"
          checked={config.obsAutoConnect}
          onChange={e => update('obsAutoConnect', e.target.checked)}
          className="h-4 w-4 rounded border-app-border text-app-accent"
        />
      </Field>

      <div className="space-y-1">
        <button
          onClick={test}
          disabled={testing}
          className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover text-app-on-accent rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {testing ? 'A ligar...' : 'Testar ligação'}
        </button>
        {testResult === 'success' && <p className="text-green-400 text-xs">Ligação bem-sucedida!</p>}
        {testResult && testResult !== 'success' && <p className="text-red-400 text-xs">{testResult}</p>}
      </div>

      <h3 className="font-semibold text-app-high pt-4">Nomes das Cenas</h3>
      <Field label="Câmara">
        <input type="text" value={config.scenes.camera} onChange={e => update('scenes', { ...config.scenes, camera: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Partilha de Ecrã">
        <input type="text" value={config.scenes.screenShare} onChange={e => update('scenes', { ...config.scenes, screenShare: e.target.value })} className={inputClass} />
      </Field>
      <Field label="Ecrã + Câmara">
        <input type="text" value={config.scenes.screenWithCam} onChange={e => update('scenes', { ...config.scenes, screenWithCam: e.target.value })} className={inputClass} />
      </Field>
      <Field label="StandBy">
        <input type="text" value={config.scenes.standby} onChange={e => update('scenes', { ...config.scenes, standby: e.target.value })} className={inputClass} />
      </Field>
    </div>
  )
}

// ── Paths Settings ───────────────────────────────────────────
function PathsSettings({ config, update }: any) {
  const pick = async (key: string, filters: any[]) => {
    const file = await window.electronAPI.files.openDialog({ title: 'Selecionar', filters })
    if (file) update(key, file)
  }

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold text-app-high">Caminhos do Sistema</h3>

      <Field label="Pasta de Hinos">
        <div className="flex gap-2">
          <input type="text" value={config.hymnBasePath} readOnly className={`${inputClass} flex-1`} />
          <button onClick={() => pick('hymnBasePath', [{ name: 'Pastas', extensions: ['*'] }])} className={pickerClass}>Escolher</button>
        </div>
      </Field>

      <Field label="Extensão dos Hinos">
        <select value={config.hymnExtension} onChange={e => update('hymnExtension', e.target.value)} className={inputClass}>
          {['mp4', 'mkv', 'avi', 'mov'].map(ext => (
            <option key={ext} value={ext}>.{ext}</option>
          ))}
        </select>
      </Field>

      <Field label="Pasta de Downloads">
        <div className="flex gap-2">
          <input type="text" value={config.downloadPath} readOnly className={`${inputClass} flex-1`} />
          <button onClick={() => pick('downloadPath', [{ name: 'Pastas', extensions: ['*'] }])} className={pickerClass}>Escolher</button>
        </div>
      </Field>

      <Field label="Caminho do VLC">
        <div className="flex gap-2">
          <input type="text" value={config.vlcPath} readOnly className={`${inputClass} flex-1`} />
          <button onClick={() => pick('vlcPath', [{ name: 'Executáveis', extensions: ['exe'] }])} className={pickerClass}>Escolher</button>
        </div>
      </Field>

      <Field label="Monitor para VLC">
        <select value={config.vlcScreenIndex} onChange={e => update('vlcScreenIndex', parseInt(e.target.value))} className={inputClass}>
          {[0, 1, 2].map(i => (
            <option key={i} value={i}>Monitor {i + 1}</option>
          ))}
        </select>
      </Field>
    </div>
  )
}

// ── AI Settings ──────────────────────────────────────────────
function AISettings({ config, update }: any) {
  const [apiKey, setApiKey] = useState('')
  const [keySet, setKeySet] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.electronAPI.ai.keyStatus().then(setKeySet)
  }, [])

  const saveKey = async () => {
    setSaving(true)
    await window.electronAPI.ai.setApiKey(apiKey)
    setApiKey('')
    setKeySet(true)
    setSaving(false)
  }

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold text-app-high">OpenRouter AI</h3>

      <Field label="Chave API">
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={keySet ? '••••••••• (configurada)' : 'sk-or-...'}
            className={`${inputClass} flex-1`}
          />
          <button
            onClick={saveKey}
            disabled={!apiKey || saving}
            className="px-3 py-2 bg-app-accent hover:bg-app-accent-hover text-app-on-accent rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>
        <p className="text-xs text-app-low mt-1">
          {keySet ? '✓ Chave API configurada' : 'Sem chave API — o assistente não funcionará'}
        </p>
      </Field>

      <Field label="Modelo">
        <select
          value={config.openRouterModel}
          onChange={e => { update('openRouterModel', e.target.value); window.electronAPI.ai.setModel(e.target.value) }}
          className={inputClass}
        >
          <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash (rápido, recomendado)</option>
          <option value="anthropic/claude-3-5-haiku">Claude 3.5 Haiku</option>
          <option value="anthropic/claude-sonnet-4-5">Claude Sonnet 4.5</option>
          <option value="openai/gpt-4o-mini">GPT-4o mini</option>
        </select>
      </Field>
    </div>
  )
}

// ── Scraper Settings ─────────────────────────────────────────
function ScraperSettings({ config, update }: any) {
  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold text-app-high">URLs dos Recursos</h3>
      <p className="text-xs text-app-low">Actualizar por trimestre</p>

      <Field label="Boletim Missionário">
        <input type="url" value={config.scraperBoletimUrl} onChange={e => update('scraperBoletimUrl', e.target.value)} className={inputClass} />
      </Field>

      <Field label="Vídeo Mordomia">
        <input type="url" value={config.scraperMordomiaUrl} onChange={e => update('scraperMordomiaUrl', e.target.value)} className={inputClass} />
      </Field>
    </div>
  )
}

// ── YouTube Settings ─────────────────────────────────────────
function YouTubeSettings({ config, update }: any) {
  const [status, setStatus] = useState<{ connected: boolean; email: string | null } | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.youtube.getAuthStatus().then(setStatus)
  }, [])

  const connect = async () => {
    if (!config.youtubeClientId || !config.youtubeClientSecret) {
      setError('Preenche o Client ID e Client Secret antes de ligar.')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      await window.electronAPI.youtube.authenticate(config.youtubeClientId, config.youtubeClientSecret)
      const s = await window.electronAPI.youtube.getAuthStatus()
      setStatus(s)
    } catch (e) {
      setError(String(e))
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    await window.electronAPI.youtube.disconnect()
    setStatus({ connected: false, email: null })
  }

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold text-app-high">YouTube Data API</h3>
      <p className="text-xs text-app-low leading-relaxed">
        Cria as credenciais em <span className="text-app-mid font-mono">console.cloud.google.com</span> →
        Credenciais → OAuth 2.0 → Aplicação de ambiente de trabalho.
        Ativa a <span className="text-app-mid">YouTube Data API v3</span> no mesmo projeto.
      </p>

      <Field label="Client ID">
        <input
          type="text"
          value={config.youtubeClientId}
          onChange={e => update('youtubeClientId', e.target.value)}
          placeholder="*.apps.googleusercontent.com"
          className={inputClass}
        />
      </Field>
      <Field label="Client Secret">
        <input
          type="password"
          value={config.youtubeClientSecret}
          onChange={e => update('youtubeClientSecret', e.target.value)}
          placeholder="GOCSPX-..."
          className={inputClass}
        />
      </Field>

      <div className="space-y-2 pt-1">
        {status?.connected ? (
          <>
            <p className="text-xs text-green-400">✓ Ligado como {status.email}</p>
            <button
              onClick={disconnect}
              className="px-4 py-2 border border-red-800 text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition-colors"
            >
              Desligar conta
            </button>
          </>
        ) : (
          <button
            onClick={connect}
            disabled={connecting}
            className="px-4 py-2 bg-app-accent hover:bg-app-accent-hover text-app-on-accent rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {connecting ? 'A abrir browser...' : 'Ligar conta Google'}
          </button>
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────
const inputClass = 'w-full px-3 py-2 border border-app-border bg-app-surface text-app-high rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/50 placeholder:text-app-low'
const pickerClass = 'px-3 py-2 border border-app-border rounded-lg text-sm text-app-mid hover:bg-app-surface transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-app-mid mb-1">{label}</label>
      {children}
    </div>
  )
}
