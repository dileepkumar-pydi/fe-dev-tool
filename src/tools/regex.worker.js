import { runRegex } from './toolUtils'

self.onmessage = (event) => {
  try {
    const { pattern, flags, input } = event.data
    self.postMessage({ result: runRegex(pattern, flags, input) })
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}
