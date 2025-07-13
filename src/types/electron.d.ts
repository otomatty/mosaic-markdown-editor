// Electron API の型定義

export interface FileOperationResult {
  success: boolean
  filePath?: string
  content?: string
  error?: string
}

// テンプレートの型定義
export interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isBuiltIn: boolean
}

// テンプレートカテゴリの型定義
export type TemplateCategory = 
  | 'general'       // 一般
  | 'document'      // 文書
  | 'blog'          // ブログ
  | 'technical'     // 技術文書
  | 'meeting'       // 会議
  | 'project'       // プロジェクト
  | 'personal'      // 個人
  | 'other'         // その他

// テンプレート操作の結果
export interface TemplateOperationResult {
  success: boolean
  template?: Template
  error?: string
}

// プリセットテーマの型定義
export type PresetTheme = 
  | 'default'
  | 'github'
  | 'vscode'
  | 'solarized'
  | 'one-dark'
  | 'monokai'
  | 'atom'

// カスタムテーマの型定義
export interface CustomTheme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    background: string
    paper: string
    textPrimary: string
    textSecondary: string
    appBar: string
    border: string
    editorBackground: string
    editorBorder: string
  }
  createdAt: string
  updatedAt: string
  isBuiltIn: boolean
}

// テーマ設定の型定義
export interface ThemeSettings {
  mode: 'preset' | 'custom'
  presetTheme: PresetTheme
  customThemeId: string | null
  themeMode: 'light' | 'dark' | 'system'
  autoSwitchMode: 'off' | 'time' | 'system'
  switchTimes?: {
    lightTheme: string // HH:MM形式
    darkTheme: string // HH:MM形式
  }
}

// カスタムテーマ操作の結果
export interface CustomThemeOperationResult {
  success: boolean
  theme?: CustomTheme
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
    themeMode: 'light' | 'dark' | 'system' // 後方互換性のため残す
    theme: ThemeSettings
    mosaicLayout: Record<string, unknown> | null // MosaicNode<MosaicWindowId> | null
  }
  files: {
    recentFiles: string[]
    maxRecentFiles: number
  }
  templates: {
    userTemplates: Template[]
    defaultTemplate: string | null
    showTemplateDialogOnNew: boolean
    lastUsedCategory: TemplateCategory | null
  }
  themes: {
    customThemes: CustomTheme[]
    lastUsedCustomTheme: string | null
    showThemePreview: boolean
    exportIncludeBuiltIn: boolean
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
  
  // テンプレート操作API
  templates: {
    getAll: () => Promise<Template[]>
    getById: (id: string) => Promise<Template | null>
    getByCategory: (category: TemplateCategory) => Promise<Template[]>
    create: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TemplateOperationResult>
    update: (id: string, template: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<TemplateOperationResult>
    delete: (id: string) => Promise<TemplateOperationResult>
    exportTemplate: (id: string) => Promise<FileOperationResult>
    importTemplate: (filePath: string) => Promise<TemplateOperationResult>
  }
  
  // カスタムテーマ操作API
  themes: {
    getAll: () => Promise<CustomTheme[]>
    getById: (id: string) => Promise<CustomTheme | null>
    create: (theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CustomThemeOperationResult>
    update: (id: string, theme: Partial<Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<CustomThemeOperationResult>
    delete: (id: string) => Promise<CustomThemeOperationResult>
    exportTheme: (id: string) => Promise<FileOperationResult>
    importTheme: (filePath: string) => Promise<CustomThemeOperationResult>
    duplicate: (id: string) => Promise<CustomThemeOperationResult>
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