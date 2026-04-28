import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../store/settings.store'
import { useOBS } from '../../hooks/useOBS'

type SettingsTab = 'obs' | 'paths' | 'ai' | 'scraper'

export function SettingsPanel() {
  const [tab, setTab] = useState<SettingsTab>('obs')
  const { config, updateConfig } = useSettingsStore()
  const obs = useOBS()

  if (!config) return <div className="p-4 text-gray-400 text-sm">A carregar definições...</div>

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'obs',    label: 'OBS' },
    { id: 'paths',  label: 'Caminhos' },
    { id: 'ai',     label: 'Assistente AI' },
    { id: 'scraper',label: 'Recursos Web' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Tab nav */}
      <div className="flex border-b border-gray-200 px-4 pt-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'obs'    && <OBSSettings config={config} update={updateConfig} obs={obs} />}
        {tab === 'paths'  && <PathsSettings config={config} update={updateConfig} />}
        {tab === 'ai'     && <AISettings config={config} update={updateConfig} />}
        {tab === 'scraper'&& <ScraperSettings config={config} update={updateConfig} />}
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
      <h3 className="font-semibold text-gray-800">Ligação ao OBS</h3>
      <Field label="Host">
        <input
          type="text"
          value={config.obsHost}
          onChange={e => update('obsHost', e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Porta">
        <input
          type="number"
          value={config.obsPort}
          onChange={e => update('obsPort', parseInt(e.target.value))}
          className={inputClass}
        />
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
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
      </Field>

      <div className="space-y-1">
        <button
          onClick={test}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'A ligar...' : 'Testar ligação'}
        </button>
        {testResult === 'success' && <p className="text-green-600 text-xs">Ligação bem-sucedida!</p>}
        {testResult && testResult !== 'success' && <p className="text-red-500 text-xs">{testResult}</p>}
      </div>

      <h3 className="font-semibold text-gray-800 pt-4">Nomes das Cenas</h3>
      <Field label="Câmara">
        <input
          type="text"
          value={config.scenes.camera}
          onChange={e => update('scenes', { ...config.scenes, camera: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Partilha de Ecrã">
        <input
          type="text"
          value={config.scenes.screenShare}
          onChange={e => update('scenes', { ...config.scenes, screenShare: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Ecrã + Câmara">
        <input
          type="text"
          value={config.scenes.screenWithCam}
          onChange={e => update('scenes', { ...config.scenes, screenWithCam: e.target.value })}
          className={inputClass}
        />
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
      <h3 className="font-semibold text-gray-800">Caminhos do Sistema</h3>

      <Field label="Pasta de Hinos">
        <div className="flex gap-2">
          <input type="text" value={config.hymnBasePath} readOnly className={`${inputClass} flex-1`} />
          <button
            onClick={() => pick('hymnBasePath', [{ name: 'Pastas', extensions: ['*'] }])}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            Escolher
          </button>
        </div>
      </Field>

      <Field label="Extensão dos Hinos">
        <select
          value={config.hymnExtension}
          onChange={e => update('hymnExtension', e.target.value)}
          className={inputClass}
        >
          {['mp4', 'mkv', 'avi', 'mov'].map(ext => (
            <option key={ext} value={ext}>.{ext}</option>
          ))}
        </select>
      </Field>

      <Field label="Pasta de Downloads">
        <div className="flex gap-2">
          <input type="text" value={config.downloadPath} readOnly className={`${inputClass} flex-1`} />
          <button
            onClick={() => pick('downloadPath', [{ name: 'Pastas', extensions: ['*'] }])}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            Escolher
          </button>
        </div>
      </Field>

      <Field label="Caminho do VLC">
        <div className="flex gap-2">
          <input type="text" value={config.vlcPath} readOnly className={`${inputClass} flex-1`} />
          <button
            onClick={() => pick('vlcPath', [{ name: 'Executáveis', extensions: ['exe'] }])}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
          >
            Escolher
          </button>
        </div>
      </Field>

      <Field label="Monitor para VLC">
        <select
          value={config.vlcScreenIndex}
          onChange={e => update('vlcScreenIndex', parseInt(e.target.value))}
          className={inputClass}
        >
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
      <h3 className="font-semibold text-gray-800">OpenRouter AI</h3>

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
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '...' : 'Guardar'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
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
      <h3 className="font-semibold text-gray-800">URLs dos Recursos</h3>
      <p className="text-xs text-gray-500">Actualizar por trimestre</p>

      <Field label="Boletim Missionário">
        <input
          type="url"
          value={config.scraperBoletimUrl}
          onChange={e => update('scraperBoletimUrl', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Vídeo Mordomia">
        <input
          type="url"
          value={config.scraperMordomiaUrl}
          onChange={e => update('scraperMordomiaUrl', e.target.value)}
          className={inputClass}
        />
      </Field>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────
const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
