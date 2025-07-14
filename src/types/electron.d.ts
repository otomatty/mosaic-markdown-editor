// Electron API の型定義

export interface FileOperationResult {
  success: boolean
  filePath?: string
  content?: string
  error?: string
}

// タスク関連の型定義
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  dueDate: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  lineNumber: number | null // Markdownファイル内の行番号
}

// タスクステータスの型定義
export type TaskStatus = 'todo' | 'in-progress' | 'done'

// タスク優先度の型定義
export type TaskPriority = 'low' | 'medium' | 'high'

// タスクボードの型定義
export interface TaskBoard {
  id: string
  name: string
  description: string
  filePath: string | null // 関連するMarkdownファイル
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

// タスク操作の結果
export interface TaskOperationResult {
  success: boolean
  task?: Task
  error?: string
}

// タスクボード操作の結果
export interface TaskBoardOperationResult {
  success: boolean
  board?: TaskBoard
  error?: string
}

// タスク抽出の結果
export interface TaskExtractionResult {
  success: boolean
  tasks: Task[]
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
  tasks: {
    taskBoards: TaskBoard[]
    defaultBoardId: string | null
    autoExtractTasks: boolean
    showTaskBoardOnFileLoad: boolean
    taskDisplaySettings: {
      showDescription: boolean
      showTags: boolean
      showDueDate: boolean
      showPriority: boolean
      groupByStatus: boolean
      sortBy: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt'
      sortOrder: 'asc' | 'desc'
    }
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
  
  // タスク管理API
  tasks: {
    // タスクボード操作
    getAllBoards: () => Promise<TaskBoard[]>
    getBoardById: (id: string) => Promise<TaskBoard | null>
    createBoard: (board: Omit<TaskBoard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TaskBoardOperationResult>
    updateBoard: (id: string, board: Partial<Omit<TaskBoard, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<TaskBoardOperationResult>
    deleteBoard: (id: string) => Promise<TaskBoardOperationResult>
    
    // タスク操作
    getAllTasks: (boardId: string) => Promise<Task[]>
    getTaskById: (id: string) => Promise<Task | null>
    createTask: (boardId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TaskOperationResult>
    updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<TaskOperationResult>
    deleteTask: (id: string) => Promise<TaskOperationResult>
    
    // タスク抽出機能
    extractTasksFromMarkdown: (content: string) => Promise<TaskExtractionResult>
    extractTasksFromFile: (filePath: string) => Promise<TaskExtractionResult>
    syncTasksToMarkdown: (boardId: string, filePath: string) => Promise<FileOperationResult>
    
    // インポート・エクスポート
    exportBoard: (id: string) => Promise<FileOperationResult>
    importBoard: (filePath: string) => Promise<TaskBoardOperationResult>
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