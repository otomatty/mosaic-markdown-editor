// Electron API の型定義

export interface FileOperationResult {
  success: boolean
  filePath?: string
  content?: string
  error?: string
}

export interface ElectronAPI {
  // ファイル操作API
  openFile: () => Promise<FileOperationResult>
  saveFile: (filePath: string, content: string) => Promise<FileOperationResult>
  saveFileAs: (content: string) => Promise<FileOperationResult>
  
  // 既存のIPC API
  ipcRenderer: {
    on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    off: (channel: string, listener?: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
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