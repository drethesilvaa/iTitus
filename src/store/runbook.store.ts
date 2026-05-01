import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Moment, MomentStatus, MomentCategory } from '../types/runbook.types'
import { RUNBOOK_MOMENTS } from '../constants/runbook.constants'

interface RunbookStore {
  moments: Moment[]
  activeMomentId: string | null
  resetRunbook: () => void
  setActiveMoment: (id: string) => void
  markStatus: (id: string, status: MomentStatus) => void
  addMoment: (draft: Omit<Moment, 'id' | 'status'>) => void
  removeMoment: (id: string) => void
  reorderMoment: (id: string, afterId: string | null, targetCategory: MomentCategory) => void
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

      addMoment: (draft) => {
        const newMoment: Moment = { ...draft, id: crypto.randomUUID(), status: 'pending' }
        set(state => {
          const moments = [...state.moments]
          const lastIdx = moments.reduce((acc, m, i) => m.category === draft.category ? i : acc, -1)
          moments.splice(lastIdx + 1, 0, newMoment)
          return { moments }
        })
      },

      removeMoment: (id) =>
        set(state => ({ moments: state.moments.filter(m => m.id !== id) })),

      // Filter-then-splice: moves `id` to after `afterId` within `targetCategory`
      // Also updates the moment's category if it changed (cross-category drag)
      reorderMoment: (id, afterId, targetCategory) => {
        set(state => {
          const moved = state.moments.find(m => m.id === id)
          if (!moved) return state

          const withoutMoved = state.moments.filter(m => m.id !== id)
          const movedUpdated = { ...moved, category: targetCategory }

          if (afterId === null) {
            // Prepend before the first moment of targetCategory
            const firstTargetIdx = withoutMoved.findIndex(m => m.category === targetCategory)
            const insertAt = firstTargetIdx === -1 ? withoutMoved.length : firstTargetIdx
            const result = [...withoutMoved]
            result.splice(insertAt, 0, movedUpdated)
            return { moments: result }
          }

          const afterIdx = withoutMoved.findIndex(m => m.id === afterId)
          if (afterIdx === -1) return state

          const result = [...withoutMoved]
          result.splice(afterIdx + 1, 0, movedUpdated)
          return { moments: result }
        })
      },
    }),
    {
      name: 'runbook-v2',
      partialize: (state) => ({
        activeMomentId: state.activeMomentId,
        moments: state.moments,
      }),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<RunbookStore>
        if (p.moments?.length) {
          return { ...currentState, activeMomentId: p.activeMomentId ?? null, moments: p.moments }
        }
        return currentState
      },
    }
  )
)
