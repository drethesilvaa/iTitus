export type MomentStatus = 'pending' | 'active' | 'done'
export type MomentCategory = 'escola' | 'culto'

export type SoftwareActionType = 'set-scene' | 'open-hymn' | 'open-file' | 'start-stream' | 'stop-stream'

export interface SoftwareAction {
  type: SoftwareActionType
  scene?: string
  hint?: string
}

export interface Moment {
  id: string
  label: string
  category: MomentCategory
  sceneHint?: 'camera' | 'screenShare' | 'screenWithCam'
  hardwareInstructions?: string[]
  softwareActions?: SoftwareAction[]
  status: MomentStatus
}
