import { ipcRenderer, contextBridge } from 'electron'
import type { FileOperationResult, AppSettings, SettingsOperationResult } from '../src/types/electron'

// --------- Expose Electron API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作API
  openFile: (): Promise<FileOperationResult> => 
    ipcRenderer.invoke('file:open'),
  
  saveFile: (filePath: string, content: string): Promise<FileOperationResult> => 
    ipcRenderer.invoke('file:save', filePath, content),
  
  saveFileAs: (content: string): Promise<FileOperationResult> => 
    ipcRenderer.invoke('file:saveAs', content),

  // 設定管理API
  settings: {
    get: <K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> =>
      ipcRenderer.invoke('settings:get', key),
    
    set: <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<SettingsOperationResult> =>
      ipcRenderer.invoke('settings:set', key, value),
    
    reset: (): Promise<SettingsOperationResult> =>
      ipcRenderer.invoke('settings:reset'),
    
    getAll: (): Promise<AppSettings> =>
      ipcRenderer.invoke('settings:getAll'),
  },

  // 既存のIPC API（下位互換性のため残す）
  ipcRenderer: {
    on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) {
      return ipcRenderer.on(channel, listener)
    },
    off(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) {
      if (listener) {
        return ipcRenderer.off(channel, listener)
      } else {
        return ipcRenderer.removeAllListeners(channel)
      }
    },
    send(channel: string, ...args: unknown[]) {
      return ipcRenderer.send(channel, ...args)
    },
    invoke(channel: string, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args)
    }
  }
})
