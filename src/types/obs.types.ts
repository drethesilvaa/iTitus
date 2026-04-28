export interface OBSState {
  isConnected: boolean
  isStreaming: boolean
  currentScene: string
  scenes: string[]
  connectionError: string | null
}
