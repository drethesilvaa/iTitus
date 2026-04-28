import { create } from 'zustand'
import type { AppConfig } from '../../shared/electron-api.types'

interface SettingsStore {
  config: AppConfig | null
  isLoaded: boolean
  loadConfig: () => Promise<void>
  updateConfig: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  config: null,
  isLoaded: false,

  loadConfig: async () => {
    const config = await window.electronAPI.config.getAll()
    set({ config, isLoaded: true })
  },

  updateConfig: async (key, value) => {
    await window.electronAPI.config.set(key, value)
    set(state => ({
      config: state.config ? { ...state.config, [key]: value } : null,
    }))
  },
}))
