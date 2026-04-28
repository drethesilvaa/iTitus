import { create } from 'zustand'

interface OBSStore {
  isConnected: boolean
  isStreaming: boolean
  currentScene: string
  scenes: string[]
  connectionError: string | null
  setConnected: (v: boolean) => void
  setStreaming: (v: boolean) => void
  setCurrentScene: (s: string) => void
  setScenes: (s: string[]) => void
  setError: (e: string | null) => void
}

export const useOBSStore = create<OBSStore>((set) => ({
  isConnected:   false,
  isStreaming:   false,
  currentScene:  '',
  scenes:        [],
  connectionError: null,
  setConnected:    (v) => set({ isConnected: v, connectionError: null }),
  setStreaming:    (v) => set({ isStreaming: v }),
  setCurrentScene: (s) => set({ currentScene: s }),
  setScenes:       (s) => set({ scenes: s }),
  setError:        (e) => set({ connectionError: e }),
}))
