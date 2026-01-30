import { create } from 'zustand'
import { AudienceConfig } from '@/types'

interface AudienceState {
  config: AudienceConfig
  setConfig: (config: AudienceConfig) => void
}

const DEFAULT_CONFIG: AudienceConfig = {
  members: [],
  triggers: [],
}

export const useAudienceStore = create<AudienceState>((set) => ({
  config: DEFAULT_CONFIG,
  setConfig: (config) => set({ config }),
}))
