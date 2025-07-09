import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import type { FileOperationResult } from '../src/types/electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
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
