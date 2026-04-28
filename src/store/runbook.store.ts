import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Moment, MomentStatus } from '../types/runbook.types'
import { RUNBOOK_MOMENTS } from '../constants/runbook.constants'

interface RunbookStore {
  moments: Moment[]
  activeMomentId: string | null
  resetRunbook: () => void
  setActiveMoment: (id: string) => void
  markStatus: (id: string, status: MomentStatus) => void
}

export const useRunbookStore = create<RunbookStore>()(
  persist(
    (set, get) => ({
      moments: RUNBOOK_MOMENTS.map(m => ({ ...m })),
      activeMomentId: null,

      resetRunbook: () =>
        set({ moments: RUNBOOK_MOMENTS.map(m => ({ ...m, status: 'pending' })), activeMomentId: null }),

      setActiveMoment: (id) => {
        set(state => ({
          activeMomentId: id,
          moments: state.moments.map(m =>
            m.id === id
              ? { ...m, status: 'active' }
              : m.status === 'active'
                ? { ...m, status: 'pending' }
                : m
          ),
        }))

        // Auto-switch OBS scene based on sceneHint
        const moment = get().moments.find(m => m.id === id)
        if (!moment?.sceneHint) return

        window.electronAPI.config.getAll().then(cfg => {
          const sceneName = cfg.scenes[moment.sceneHint!]
          if (sceneName) window.electronAPI.obs.switchScene(sceneName).catch(() => {})
        })
      },

      markStatus: (id, status) =>
        set(state => ({
          moments: state.moments.map(m => m.id === id ? { ...m, status } : m),
        })),
    }),
    {
      name: 'runbook-v1',
      // Only persist status and activeMomentId, not the full moment definitions
      partialize: (state) => ({
        activeMomentId: state.activeMomentId,
        moments: state.moments.map(({ id, status }) => ({ id, status })),
      }),
      // Rehydrate: merge persisted statuses into fresh moment definitions
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { moments: { id: string; status: MomentStatus }[]; activeMomentId: string | null }
        const statusMap = new Map(persisted.moments?.map(m => [m.id, m.status]) ?? [])
        return {
          ...currentState,
          activeMomentId: persisted.activeMomentId ?? null,
          moments: currentState.moments.map(m => ({
            ...m,
            status: statusMap.get(m.id) ?? m.status,
          })),
        }
      },
    }
  )
)
