import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import Store from 'electron-store'
import type { FileOperationResult, AppSettings, SettingsOperationResult, Template, TemplateOperationResult, TemplateCategory, CustomTheme, CustomThemeOperationResult } from '../src/types/electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 設定ストアの初期化
const store = new Store<AppSettings>({
  defaults: {
    window: {
      width: 1200,
      height: 800,
      isMaximized: false,
    },
    ui: {
      language: 'ja',
      themeMode: 'system', // 後方互換性のため残す
      theme: {
        mode: 'preset',
        presetTheme: 'default',
        customThemeId: null,
        themeMode: 'system',
        autoSwitchMode: 'system',
        switchTimes: {
          lightTheme: '06:00',
          darkTheme: '18:00',
        },
      },
      mosaicLayout: {
        direction: 'row',
        first: 'editor',
        second: 'preview',
        splitPercentage: 50,
      },
    },
    files: {
      recentFiles: [],
      maxRecentFiles: 10,
    },
    templates: {
      userTemplates: [],
      defaultTemplate: null,
      showTemplateDialogOnNew: true,
      lastUsedCategory: null,
    },
    themes: {
      customThemes: [],
      lastUsedCustomTheme: null,
      showThemePreview: true,
      exportIncludeBuiltIn: false,
    },
  },
})

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  // 保存されたウィンドウ設定を読み込み
  const windowSettings = store.get('window')
  
  win = new BrowserWindow({
    width: windowSettings.width,
    height: windowSettings.height,
    x: windowSettings.x,
    y: windowSettings.y,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    show: false, // ウィンドウを最初は非表示にして、準備完了後に表示
  })

  // 保存された最大化状態を復元
  if (windowSettings.isMaximized) {
    win.maximize()
  }

  // ウィンドウが準備完了したら表示
  win.once('ready-to-show', () => {
    win?.show()
  })

  // ウィンドウのサイズ・位置変更を監視して保存
  const saveWindowState = () => {
    if (!win) return
    
    const bounds = win.getBounds()
    const isMaximized = win.isMaximized()
    
    store.set('window', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized,
    })
  }

  // ウィンドウイベントのリスナーを追加
  win.on('resize', saveWindowState)
  win.on('move', saveWindowState)
  win.on('maximize', saveWindowState)
  win.on('unmaximize', saveWindowState)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    console.log('Renderer process loaded successfully')
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error('Failed to load renderer process:', errorCode, errorDescription)
  })

  win.webContents.on('render-process-gone', (_, details) => {
    console.error('Renderer process gone:', details)
  })

  if (VITE_DEV_SERVER_URL) {
    console.log('Loading development server URL:', VITE_DEV_SERVER_URL)
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    console.log('Loading production file:', path.join(RENDERER_DIST, 'index.html'))
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// 設定管理のIPCハンドラー
ipcMain.handle('settings:get', async <K extends keyof AppSettings>(_event: Electron.IpcMainInvokeEvent, key: K): Promise<AppSettings[K]> => {
  try {
    return store.get(key)
  } catch (error) {
    console.error('Settings get error:', error)
    throw error
  }
})

ipcMain.handle('settings:set', async <K extends keyof AppSettings>(_event: Electron.IpcMainInvokeEvent, key: K, value: AppSettings[K]): Promise<SettingsOperationResult> => {
  try {
    store.set(key, value)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `設定保存エラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('settings:reset', async (): Promise<SettingsOperationResult> => {
  try {
    store.clear()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `設定リセットエラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('settings:getAll', async (): Promise<AppSettings> => {
  try {
    return store.store
  } catch (error) {
    console.error('Settings getAll error:', error)
    throw error
  }
})

// ファイル操作のIPCハンドラー
ipcMain.handle('file:open', async (): Promise<FileOperationResult> => {
  try {
    const result = await dialog.showOpenDialog(win!, {
      title: 'ファイルを開く',
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'ファイル選択がキャンセルされました' }
    }

    const filePath = result.filePaths[0]
    const content = await readFile(filePath, 'utf-8')
    
    // 最近開いたファイルに追加
    const recentFiles = store.get('files.recentFiles')
    const maxRecentFiles = store.get('files.maxRecentFiles')
    
    // 重複を削除して先頭に追加
    const updatedRecentFiles = [filePath, ...recentFiles.filter(f => f !== filePath)]
      .slice(0, maxRecentFiles)
    
    store.set('files.recentFiles', updatedRecentFiles)
    
    return {
      success: true,
      filePath,
      content
    }
  } catch (error) {
    return {
      success: false,
      error: `ファイル読み込みエラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('file:save', async (_event, filePath: string, content: string): Promise<FileOperationResult> => {
  try {
    await writeFile(filePath, content, 'utf-8')
    
    // 最近開いたファイルに追加
    const recentFiles = store.get('files.recentFiles')
    const maxRecentFiles = store.get('files.maxRecentFiles')
    
    // 重複を削除して先頭に追加
    const updatedRecentFiles = [filePath, ...recentFiles.filter(f => f !== filePath)]
      .slice(0, maxRecentFiles)
    
    store.set('files.recentFiles', updatedRecentFiles)
    
    return {
      success: true,
      filePath
    }
  } catch (error) {
    return {
      success: false,
      error: `ファイル保存エラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('file:saveAs', async (_event, content: string): Promise<FileOperationResult> => {
  try {
    const result = await dialog.showSaveDialog(win!, {
      title: 'ファイルを保存',
      filters: [
        { name: 'Markdown Files', extensions: ['md'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      defaultPath: 'untitled.md'
    })

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'ファイル保存がキャンセルされました' }
    }

    await writeFile(result.filePath, content, 'utf-8')
    
    // 最近開いたファイルに追加
    const recentFiles = store.get('files.recentFiles')
    const maxRecentFiles = store.get('files.maxRecentFiles')
    
    // 重複を削除して先頭に追加
    const updatedRecentFiles = [result.filePath, ...recentFiles.filter(f => f !== result.filePath)]
      .slice(0, maxRecentFiles)
    
    store.set('files.recentFiles', updatedRecentFiles)
    
    return {
      success: true,
      filePath: result.filePath
    }
  } catch (error) {
    return {
      success: false,
      error: `ファイル保存エラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

// テンプレート操作のIPCハンドラー
ipcMain.handle('template:getAll', async (): Promise<Template[]> => {
  try {
    const templates = store.get('templates.userTemplates')
    return templates
  } catch (error) {
    console.error('Template getAll error:', error)
    return []
  }
})

ipcMain.handle('template:getById', async (_event, id: string): Promise<Template | null> => {
  try {
    const templates = store.get('templates.userTemplates')
    return templates.find(template => template.id === id) || null
  } catch (error) {
    console.error('Template getById error:', error)
    return null
  }
})

ipcMain.handle('template:getByCategory', async (_event, category: TemplateCategory): Promise<Template[]> => {
  try {
    const templates = store.get('templates.userTemplates')
    return templates.filter(template => template.category === category)
  } catch (error) {
    console.error('Template getByCategory error:', error)
    return []
  }
})

ipcMain.handle('template:create', async (_event, templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplateOperationResult> => {
  try {
    const now = new Date().toISOString()
    const newTemplate: Template = {
      ...templateData,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    
    const templates = store.get('templates.userTemplates')
    const updatedTemplates = [...templates, newTemplate]
    
    store.set('templates.userTemplates', updatedTemplates)
    
    return {
      success: true,
      template: newTemplate
    }
  } catch (error) {
    return {
      success: false,
      error: `テンプレート作成エラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('template:update', async (_event, id: string, templateData: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TemplateOperationResult> => {
  try {
    const templates = store.get('templates.userTemplates')
    const templateIndex = templates.findIndex(template => template.id === id)
    
    if (templateIndex === -1) {
      return {
        success: false,
        error: 'テンプレートが見つかりませんでした'
      }
    }
    
    const updatedTemplate: Template = {
      ...templates[templateIndex],
      ...templateData,
      updatedAt: new Date().toISOString()
    }
    
    const updatedTemplates = [...templates]
    updatedTemplates[templateIndex] = updatedTemplate
    
    store.set('templates.userTemplates', updatedTemplates)
    
    return {
      success: true,
      template: updatedTemplate
    }
  } catch (error) {
    return {
      success: false,
      error: `テンプレート更新エラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('template:delete', async (_event, id: string): Promise<TemplateOperationResult> => {
  try {
    const templates = store.get('templates.userTemplates')
    const templateIndex = templates.findIndex(template => template.id === id)
    
    if (templateIndex === -1) {
      return {
        success: false,
        error: 'テンプレートが見つかりませんでした'
      }
    }
    
    const deletedTemplate = templates[templateIndex]
    const updatedTemplates = templates.filter(template => template.id !== id)
    
    store.set('templates.userTemplates', updatedTemplates)
    
    return {
      success: true,
      template: deletedTemplate
    }
  } catch (error) {
    return {
      success: false,
      error: `テンプレート削除エラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('template:export', async (_event, id: string): Promise<FileOperationResult> => {
  try {
    const templates = store.get('templates.userTemplates')
    const template = templates.find(template => template.id === id)
    
    if (!template) {
      return {
        success: false,
        error: 'テンプレートが見つかりませんでした'
      }
    }
    
    const result = await dialog.showSaveDialog(win!, {
      title: 'テンプレートをエクスポート',
      defaultPath: `${template.name}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (result.canceled || !result.filePath) {
      return { success: false, error: 'エクスポートがキャンセルされました' }
    }
    
    const exportData = {
      template,
      exportedAt: new Date().toISOString(),
      appVersion: app.getVersion()
    }
    
    await writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8')
    
    return {
      success: true,
      filePath: result.filePath
    }
  } catch (error) {
    return {
      success: false,
      error: `テンプレートエクスポートエラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

ipcMain.handle('template:import', async (_event, filePath: string): Promise<TemplateOperationResult> => {
  try {
    const content = await readFile(filePath, 'utf-8')
    const importData = JSON.parse(content)
    
    // インポートデータの検証
    if (!importData.template || typeof importData.template !== 'object') {
      return {
        success: false,
        error: 'テンプレートデータが不正です'
      }
    }
    
    const template = importData.template
    const requiredFields = ['name', 'description', 'category', 'content', 'tags']
    
    for (const field of requiredFields) {
      if (!(field in template)) {
        return {
          success: false,
          error: `必須フィールド "${field}" が見つかりません`
        }
      }
    }
    
    // 新しいIDと日時を生成
    const now = new Date().toISOString()
    const newTemplate: Template = {
      ...template,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      isBuiltIn: false
    }
    
    const templates = store.get('templates.userTemplates')
    const updatedTemplates = [...templates, newTemplate]
    
    store.set('templates.userTemplates', updatedTemplates)
    
    return {
      success: true,
      template: newTemplate
    }
  } catch (error) {
    return {
      success: false,
      error: `テンプレートインポートエラー: ${error instanceof Error ? error.message : String(error)}`
    }
  }
})

// カスタムテーマ管理のIPCハンドラー
ipcMain.handle('themes:getAll', async (): Promise<CustomTheme[]> => {
  try {
    const themes = store.get('themes.customThemes', [])
    return themes
  } catch (error) {
    console.error('Failed to get all themes:', error)
    return []
  }
})

ipcMain.handle('themes:getById', async (_, id: string): Promise<CustomTheme | null> => {
  try {
    const themes = store.get('themes.customThemes', [])
    return themes.find(theme => theme.id === id) || null
  } catch (error) {
    console.error('Failed to get theme by ID:', error)
    return null
  }
})

ipcMain.handle('themes:create', async (_, themeData: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomThemeOperationResult> => {
  try {
    const themes = store.get('themes.customThemes', [])
    const now = new Date().toISOString()
    
    const newTheme: CustomTheme = {
      id: randomUUID(),
      name: themeData.name,
      description: themeData.description,
      colors: themeData.colors,
      createdAt: now,
      updatedAt: now,
      isBuiltIn: false,
    }
    
    themes.push(newTheme)
    store.set('themes.customThemes', themes)
    
    return { success: true, theme: newTheme }
  } catch (error) {
    console.error('Failed to create theme:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('themes:update', async (_, id: string, themeData: Partial<Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CustomThemeOperationResult> => {
  try {
    const themes = store.get('themes.customThemes', [])
    const themeIndex = themes.findIndex(theme => theme.id === id)
    
    if (themeIndex === -1) {
      return { success: false, error: 'Theme not found' }
    }
    
    const existingTheme = themes[themeIndex]
    const now = new Date().toISOString()
    
    const updatedTheme: CustomTheme = {
      ...existingTheme,
      ...themeData,
      id: existingTheme.id,
      createdAt: existingTheme.createdAt,
      updatedAt: now,
    }
    
    themes[themeIndex] = updatedTheme
    store.set('themes.customThemes', themes)
    
    return { success: true, theme: updatedTheme }
  } catch (error) {
    console.error('Failed to update theme:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('themes:delete', async (_, id: string): Promise<CustomThemeOperationResult> => {
  try {
    const themes = store.get('themes.customThemes', [])
    const themeIndex = themes.findIndex(theme => theme.id === id)
    
    if (themeIndex === -1) {
      return { success: false, error: 'Theme not found' }
    }
    
    const deletedTheme = themes[themeIndex]
    themes.splice(themeIndex, 1)
    store.set('themes.customThemes', themes)
    
    // 削除されたテーマが最後に使用されたテーマの場合、クリア
    const lastUsedTheme = store.get('themes.lastUsedCustomTheme')
    if (lastUsedTheme === id) {
      store.set('themes.lastUsedCustomTheme', null)
    }
    
    return { success: true, theme: deletedTheme }
  } catch (error) {
    console.error('Failed to delete theme:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('themes:exportTheme', async (_, id: string): Promise<FileOperationResult> => {
  try {
    const themes = store.get('themes.customThemes', [])
    const theme = themes.find(theme => theme.id === id)
    
    if (!theme) {
      return { success: false, error: 'Theme not found' }
    }
    
    const result = await dialog.showSaveDialog({
      title: 'Export Theme',
      defaultPath: `${theme.name}.mosaic-theme.json`,
      filters: [
        { name: 'Mosaic Theme Files', extensions: ['mosaic-theme.json'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (result.canceled || !result.filePath) {
      return { success: false, error: 'Export cancelled' }
    }
    
    const exportData = {
      name: theme.name,
      description: theme.description,
      colors: theme.colors,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    await writeFile(result.filePath, JSON.stringify(exportData, null, 2))
    return { success: true, filePath: result.filePath }
  } catch (error) {
    console.error('Failed to export theme:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('themes:importTheme', async (_, filePath: string): Promise<CustomThemeOperationResult> => {
  try {
    const fileContent = await readFile(filePath, 'utf8')
    const importData = JSON.parse(fileContent)
    
    // 基本的なバリデーション
    if (!importData.name || !importData.colors) {
      return { success: false, error: 'Invalid theme file format' }
    }
    
    const themes = store.get('themes.customThemes', [])
    const now = new Date().toISOString()
    
    const newTheme: CustomTheme = {
      id: randomUUID(),
      name: importData.name,
      description: importData.description || '',
      colors: importData.colors,
      createdAt: now,
      updatedAt: now,
      isBuiltIn: false,
    }
    
    themes.push(newTheme)
    store.set('themes.customThemes', themes)
    
    return { success: true, theme: newTheme }
  } catch (error) {
    console.error('Failed to import theme:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('themes:duplicate', async (_, id: string): Promise<CustomThemeOperationResult> => {
  try {
    const themes = store.get('themes.customThemes', [])
    const originalTheme = themes.find(theme => theme.id === id)
    
    if (!originalTheme) {
      return { success: false, error: 'Theme not found' }
    }
    
    const now = new Date().toISOString()
    
    const duplicatedTheme: CustomTheme = {
      id: randomUUID(),
      name: `${originalTheme.name} (Copy)`,
      description: originalTheme.description,
      colors: { ...originalTheme.colors },
      createdAt: now,
      updatedAt: now,
      isBuiltIn: false,
    }
    
    themes.push(duplicatedTheme)
    store.set('themes.customThemes', themes)
    
    return { success: true, theme: duplicatedTheme }
  } catch (error) {
    console.error('Failed to duplicate theme:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})
