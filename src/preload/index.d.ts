import type { BPasteApi } from './index'

declare global {
  interface Window {
    bpaste: BPasteApi
  }
}

export {}
