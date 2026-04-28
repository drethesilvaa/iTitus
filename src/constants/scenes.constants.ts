// Default OBS scene names — editable in Settings
export const DEFAULT_SCENE_MAP = {
  camera:        'Câmara',
  screenShare:   'Partilha Ecrã',
  screenWithCam: 'Ecrã + Câmara',
} as const

export type SceneKey = keyof typeof DEFAULT_SCENE_MAP
