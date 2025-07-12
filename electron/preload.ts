import { ipcRenderer, contextBridge } from 'electron'
import type { FileOperationResult, AppSettings, SettingsOperationResult, Template, TemplateOperationResult, TemplateCategory, CustomTheme, CustomThemeOperationResult } from '../src/types/electron'

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
  
  // テンプレート管理API
  templates: {
    getAll: (): Promise<Template[]> =>
      ipcRenderer.invoke('templates:getAll'),
    
    getById: (id: string): Promise<Template | null> =>
      ipcRenderer.invoke('templates:getById', id),
    
    getByCategory: (category: TemplateCategory): Promise<Template[]> =>
      ipcRenderer.invoke('templates:getByCategory', category),
    
    create: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplateOperationResult> =>
      ipcRenderer.invoke('templates:create', template),
    
    update: (id: string, template: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TemplateOperationResult> =>
      ipcRenderer.invoke('templates:update', id, template),
    
    delete: (id: string): Promise<TemplateOperationResult> =>
      ipcRenderer.invoke('templates:delete', id),
    
    exportTemplate: (id: string): Promise<FileOperationResult> =>
      ipcRenderer.invoke('templates:exportTemplate', id),
    
    importTemplate: (filePath: string): Promise<TemplateOperationResult> =>
      ipcRenderer.invoke('templates:importTemplate', filePath),
  },
  
  // カスタムテーマ管理API
  themes: {
    getAll: (): Promise<CustomTheme[]> =>
      ipcRenderer.invoke('themes:getAll'),
    
    getById: (id: string): Promise<CustomTheme | null> =>
      ipcRenderer.invoke('themes:getById', id),
    
    create: (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomThemeOperationResult> =>
      ipcRenderer.invoke('themes:create', theme),
    
    update: (id: string, theme: Partial<Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CustomThemeOperationResult> =>
      ipcRenderer.invoke('themes:update', id, theme),
    
    delete: (id: string): Promise<CustomThemeOperationResult> =>
      ipcRenderer.invoke('themes:delete', id),
    
    exportTheme: (id: string): Promise<FileOperationResult> =>
      ipcRenderer.invoke('themes:exportTheme', id),
    
    importTheme: (filePath: string): Promise<CustomThemeOperationResult> =>
      ipcRenderer.invoke('themes:importTheme', filePath),
    
    duplicate: (id: string): Promise<CustomThemeOperationResult> =>
      ipcRenderer.invoke('themes:duplicate', id),
  },
  
  // 既存のIPC API
  ipcRenderer: {
    on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.on(channel, listener)
    },
    off: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => {
      ipcRenderer.off(channel, listener)
    },
    send: (channel: string, ...args: unknown[]) => {
      ipcRenderer.send(channel, ...args)
    },
    invoke: (channel: string, ...args: unknown[]) => {
      return ipcRenderer.invoke(channel, ...args)
    },
  },
})
