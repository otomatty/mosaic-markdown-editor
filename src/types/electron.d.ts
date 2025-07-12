// Electron API の型定義
import { MosaicNode } from 'react-mosaic-component'

// Mosaic Window IDの型定義
type MosaicWindowId = 'editor' | 'preview'

export interface FileOperationResult {
  success: boolean
  filePath?: string
  content?: string
  error?: string
}

// 設定データの型定義
export interface AppSettings {
  window: {
    width: number
    height: number
    x?: number
    y?: number
    isMaximized: boolean
  }
  ui: {
    language: string
    mosaicLayout: MosaicNode<MosaicWindowId> | null
  }
  files: {
    recentFiles: string[]
    maxRecentFiles: number
  }
}

// 設定操作の結果
export interface SettingsOperationResult {
  success: boolean
  error?: string
}

export interface ElectronAPI {
  // ファイル操作API
  openFile: () => Promise<FileOperationResult>
  saveFile: (filePath: string, content: string) => Promise<FileOperationResult>
  saveFileAs: (content: string) => Promise<FileOperationResult>
  
  // 設定操作API
  settings: {
    get: <K extends keyof AppSettings>(key: K) => Promise<AppSettings[K]>
    set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<SettingsOperationResult>
    reset: () => Promise<SettingsOperationResult>
    getAll: () => Promise<AppSettings>
  }
  
  // 既存のIPC API
  ipcRenderer: {
    on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    off: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    send: (channel: string, ...args: unknown[]) => void
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}

// グローバルなwindowオブジェクトに型を追加
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} 