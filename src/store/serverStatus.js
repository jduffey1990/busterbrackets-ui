import { defineStore } from 'pinia'

const MAX_ATTEMPTS = 15
const RETRY_INTERVAL_MS = 4000

export const useServerStatusStore = defineStore('serverStatus', {
  state: () => ({
    bracketsReady: false,
    bracketsError: false,
    bracketsChecking: false,
  }),
  actions: {
    async awaitBracketsReady(bracketsApi) {
      // Avoid double-running if already confirmed live
      if (this.bracketsReady) return

      this.bracketsChecking = true
      this.bracketsError = false

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
          const response = await bracketsApi.get('/ping-bracket')
          if (response.status === 200) {
            this.bracketsReady = true
            this.bracketsChecking = false
            return
          }
        } catch {
          // Server not ready yet — cold starting, keep retrying
        }

        // Don't wait after the last attempt
        if (attempt < MAX_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS))
        }
      }

      // All attempts exhausted
      this.bracketsChecking = false
      this.bracketsError = true
    },
  },
})