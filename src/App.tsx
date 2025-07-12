import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import { makeStyles } from 'tss-react/mui'
import { Mosaic, MosaicWindow, MosaicNode, MosaicBranch } from 'react-mosaic-component'
import 'react-mosaic-component/react-mosaic-component.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import { createAppTheme } from './theme'
import AppHeader from './components/AppHeader'
import EditorPanel from './components/EditorPanel'
import PreviewPanel from './components/PreviewPanel'
import WelcomeScreen from './components/WelcomeScreen'
import NotificationSnackbar from './components/NotificationSnackbar'
import DropTargetOverlay from './components/DropTargetOverlay'
import ShortcutHelpDialog from './components/ShortcutHelpDialog'
import TemplateSelectionDialog from './components/TemplateSelectionDialog'
import TemplateManagementDialog from './components/TemplateManagementDialog'
import ThemeEditorDialog from './components/ThemeEditorDialog'
import { useAppSettings } from './hooks/useAppSettings'
import type { Template, ThemeSettings } from './types/electron'

// Mosaic Window IDの型定義
type MosaicWindowId = 'editor' | 'preview'

// TSS-Reactでスタイルを定義
const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0, // これがflexboxで重要
  },
  mosaicContainer: {
    flexGrow: 1,
    position: 'relative',
    height: '100%', // 明示的な高さを設定
    minHeight: 0, // 子要素のサイズ制限を回避
    
    // React Mosaicの高さを保証
    '& .mosaic-root': {
      height: '100%',
    },
    
    // MosaicWindowの高さを調整
    '& .mosaic-window': {
      display: 'flex',
      flexDirection: 'column',
    },
    
    // MosaicWindowのbody部分
    '& .mosaic-window-body': {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
  },
}))

function App() {
  const { classes } = useStyles()
  const { t } = useTranslation()
  
  // 設定管理フックの使用
  const { 
    settings, 
    isLoading: isSettingsLoading,
    updateMosaicLayout,
    updateUISettings,
    addRecentFile,
    error: settingsError
  } = useAppSettings()

  // テーマ設定に基づいてテーマを動的に生成
  const currentTheme = useMemo(() => {
    if (!settings) {
      // 設定がまだ読み込まれていない場合はデフォルトライトテーマ
      return createAppTheme('light')
    }
    return createAppTheme(settings.ui.themeMode)
  }, [settings])
  
  // Mosaic レイアウトの状態管理（設定から初期化）
  const [mosaicLayout, setMosaicLayout] = useState<MosaicNode<MosaicWindowId> | null>(null)
  
  // ファイル操作の状態管理
  const [fileContent, setFileContent] = useState<string>('')
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false)
  const [fileMenuAnchor, setFileMenuAnchor] = useState<null | HTMLElement>(null)
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info' | 'warning'
  }>({
    open: false,
    message: '',
    severity: 'info'
  })
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState<boolean>(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState<boolean>(false)
  const [isTemplateManagementDialogOpen, setIsTemplateManagementDialogOpen] = useState<boolean>(false)
  const [isThemeEditorDialogOpen, setIsThemeEditorDialogOpen] = useState<boolean>(false)

  // 通知の表示
  const showNotification = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ open: true, message, severity })
  }, [])

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  // ファイルメニューの開閉
  const handleFileMenuClose = useCallback(() => {
    setFileMenuAnchor(null)
  }, [])

  // 設定が読み込まれたら初期化
  useEffect(() => {
    if (settings && !isSettingsLoading) {
      // Mosaicレイアウトを設定から復元
      if (settings.ui.mosaicLayout) {
        setMosaicLayout(settings.ui.mosaicLayout as unknown as MosaicNode<MosaicWindowId>)
      } else {
        // デフォルトレイアウト
        setMosaicLayout({
          direction: 'row',
          first: 'editor',
          second: 'preview',
          splitPercentage: 50,
        })
      }
    }
  }, [settings, isSettingsLoading])

  // 設定エラーの通知
  useEffect(() => {
    if (settingsError) {
      showNotification(`設定エラー: ${settingsError}`, 'error')
    }
  }, [settingsError, showNotification])

  // ファイル操作の実装
  const handleOpenFile = useCallback(async () => {
    handleFileMenuClose()
    
    try {
      const result = await window.electronAPI.openFile()
      if (result.success && result.content && result.filePath) {
        setFileContent(result.content)
        setCurrentFilePath(result.filePath)
        setHasUnsavedChanges(false)
        setIsEditorOpen(true)
        
        // 最近開いたファイルに追加（レンダラープロセス側での追加）
        if (addRecentFile) {
          addRecentFile(result.filePath).catch(error => {
            console.error('Failed to add recent file:', error)
          })
        }
        
        showNotification(t('notification.fileOpened', { filename: result.filePath }), 'success')
      } else {
        showNotification(t('notification.fileOpenError', { error: result.error || 'Unknown error' }), 'error')
      }
    } catch (error) {
      showNotification(t('notification.fileOpenError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }, [handleFileMenuClose, addRecentFile, t, showNotification])

  const handleSaveAsFile = useCallback(async () => {
    handleFileMenuClose()
    
    try {
      const result = await window.electronAPI.saveFileAs(fileContent)
      if (result.success && result.filePath) {
        setCurrentFilePath(result.filePath)
        setHasUnsavedChanges(false)
        showNotification(t('notification.fileSaved', { filename: result.filePath }), 'success')
      } else {
        showNotification(t('notification.fileSaveError', { error: result.error || 'Unknown error' }), 'error')
      }
    } catch (error) {
      showNotification(t('notification.fileSaveError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }, [handleFileMenuClose, fileContent, t, showNotification])

  const handleSaveFile = useCallback(async () => {
    handleFileMenuClose()
    
    if (!currentFilePath) {
      handleSaveAsFile()
      return
    }

    try {
      const result = await window.electronAPI.saveFile(currentFilePath, fileContent)
      if (result.success) {
        setHasUnsavedChanges(false)
        showNotification(t('notification.fileSaved', { filename: currentFilePath }), 'success')
      } else {
        showNotification(t('notification.fileSaveError', { error: result.error || 'Unknown error' }), 'error')
      }
    } catch (error) {
      showNotification(t('notification.fileSaveError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }, [handleFileMenuClose, handleSaveAsFile, currentFilePath, fileContent, t, showNotification])

  const handleCreateNew = useCallback(() => {
    handleFileMenuClose()
    
    // テンプレート選択ダイアログを開く
    setIsTemplateDialogOpen(true)
  }, [handleFileMenuClose])

  // テンプレート選択ダイアログのハンドラー
  const handleTemplateDialogClose = useCallback(() => {
    setIsTemplateDialogOpen(false)
  }, [])

  const handleTemplateSelect = useCallback((template: Template) => {
    setIsTemplateDialogOpen(false)
    
    // テンプレートの内容でファイルを作成
    setFileContent(template.content)
    setCurrentFilePath(null)
    setHasUnsavedChanges(false)
    setIsEditorOpen(true)
    
    // テンプレート使用の通知
    showNotification(t('notification.templateSelected', { templateName: template.name }), 'success')
  }, [t, showNotification])

  const handleCreateEmptyFile = useCallback(() => {
    setIsTemplateDialogOpen(false)
    
    // 空のファイルを作成
    setFileContent('')
    setCurrentFilePath(null)
    setHasUnsavedChanges(false)
    setIsEditorOpen(true)
    
    // 新規作成完了の通知
    showNotification(t('notification.newFileCreated'), 'success')
  }, [t, showNotification])

  // キーボードショートカットの実装
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Macでは⌘キー、WindowsではCtrlキーを使用
      const isModifierPressed = event.metaKey || event.ctrlKey
      
      if (!isModifierPressed) return
      
      switch (event.key.toLowerCase()) {
        case 'o':
          event.preventDefault()
          handleOpenFile()
          break
        case 's':
          event.preventDefault()
          handleSaveFile()
          break
        case 'n':
          event.preventDefault()
          handleCreateNew()
          break
        default:
          // 他のキーは処理しない
          break
      }
      
      // ヘルプ表示（F1キー）
      if (event.key === 'F1') {
        event.preventDefault()
        handleHelpDialogOpen()
      }
    }

    // イベントリスナーを追加
    window.addEventListener('keydown', handleKeyDown)

    // クリーンアップ関数
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleOpenFile, handleSaveFile, handleCreateNew]) // 関数を依存配列に追加

  // Markdownプレビューの生成
  const previewHtml = useMemo(() => {
    if (!fileContent) return ''
    
    try {
      // markedの設定
      marked.setOptions({
        breaks: true,
        gfm: true,
      })
      
      const result = marked(fileContent)
      return typeof result === 'string' ? result : ''
    } catch (error) {
      console.error('Markdown parsing error:', error)
      return `<p>${t('preview.error')}</p>`
    }
  }, [fileContent, t])

  // ファイルメニューの開閉
  const handleFileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFileMenuAnchor(event.currentTarget)
  }

  // ヘルプダイアログの開閉
  const handleHelpDialogOpen = () => {
    setIsHelpDialogOpen(true)
  }

  const handleHelpDialogClose = () => {
    setIsHelpDialogOpen(false)
  }

  // テンプレート管理ダイアログの開閉
  const handleTemplateManagementDialogOpen = () => {
    setIsTemplateManagementDialogOpen(true)
  }

  const handleTemplateManagementDialogClose = () => {
    setIsTemplateManagementDialogOpen(false)
  }

  // テーマエディタダイアログの開閉
  const handleThemeEditorDialogOpen = () => {
    setIsThemeEditorDialogOpen(true)
  }

  const handleThemeEditorDialogClose = () => {
    setIsThemeEditorDialogOpen(false)
  }

  // テーマ変更処理
  const handleThemeChange = async (themeMode: 'light' | 'dark' | 'system') => {
    if (!updateUISettings) return
    
    try {
      await updateUISettings({ themeMode })
      showNotification(t('notification.themeChanged', { theme: t(`menu.${themeMode}Theme`) }), 'success')
    } catch (error) {
      showNotification(t('notification.themeChangeError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }

  // テーマエディタからのテーマ変更処理
  const handleThemeEditorChange = (theme: ThemeSettings) => {
    console.log('ThemeEditorChange:', theme)
    // プレビュー用の処理は必要に応じて実装
    // 現在はダイアログ内で処理
  }

  // テーマエディタからのテーマ適用処理
  const handleThemeEditorApply = async (theme: ThemeSettings) => {
    if (!updateUISettings) return
    
    try {
      await updateUISettings({ theme })
      showNotification(t('notification.themeChanged', { theme: theme.mode === 'preset' ? theme.presetTheme : 'custom' }), 'success')
    } catch (error) {
      showNotification(t('notification.themeChangeError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }

  // テキストエディタの変更処理
  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = event.target.value
    setFileContent(newContent)
    setHasUnsavedChanges(true)
  }

  // ファイルドロップ処理
  const handleFilesDrop = async (files: File[]) => {
    if (files.length === 0) return
    
    const file = files[0] // 最初のファイルのみ処理
    
    try {
      const content = await file.text()
      const filePath = file.path || file.name
      
      setFileContent(content)
      setCurrentFilePath(filePath)
      setHasUnsavedChanges(false)
      setIsEditorOpen(true)
      
      // 最近開いたファイルに追加（パスが利用可能な場合のみ）
      if (file.path && addRecentFile) {
        addRecentFile(file.path).catch(error => {
          console.error('Failed to add recent file:', error)
        })
      }
      
      showNotification(t('notification.fileLoaded', { filename: file.name }), 'success')
    } catch (error) {
      showNotification(t('notification.fileLoadError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }

  // Mosaicレイアウトの変更処理
  const handleMosaicChange = (newLayout: MosaicNode<MosaicWindowId> | null) => {
    setMosaicLayout(newLayout)
    
    // 設定に保存（非同期で実行）
    if (updateMosaicLayout) {
      updateMosaicLayout(newLayout).catch(error => {
        console.error('Failed to save mosaic layout:', error)
      })
    }
  }

  // MosaicWindowのレンダリング
  const renderMosaicWindow = (id: MosaicWindowId, path: string[]) => {
    // pathをMosaicBranch[]に型キャスト
    const mosaicPath = path as MosaicBranch[]
    
    switch (id) {
      case 'editor':
        return (
          <MosaicWindow
            path={mosaicPath}
            title={t('editor.title')}
          >
            <EditorPanel
              content={fileContent}
              onChange={handleContentChange}
            />
          </MosaicWindow>
        )
      case 'preview':
        return (
          <MosaicWindow
            path={mosaicPath}
            title={t('preview.title')}
          >
            <PreviewPanel
              htmlContent={previewHtml}
            />
          </MosaicWindow>
        )
      default:
        // デフォルトケースでは空のdivを返す（nullは許可されない）
        return <div>Unknown window type</div>
    }
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <div className={classes.root}>
        <AppHeader
          currentFilePath={currentFilePath}
          hasUnsavedChanges={hasUnsavedChanges}
          fileMenuAnchor={fileMenuAnchor}
          onFileMenuOpen={handleFileMenuOpen}
          onFileMenuClose={handleFileMenuClose}
          onOpenFile={handleOpenFile}
          onSaveFile={handleSaveFile}
          onSaveAsFile={handleSaveAsFile}
          onCreateNew={handleCreateNew}
          currentThemeMode={settings?.ui.themeMode || 'system'}
          onThemeChange={handleThemeChange}
          onHelpDialogOpen={handleHelpDialogOpen}
          onTemplateManagementOpen={handleTemplateManagementDialogOpen}
          onThemeEditorOpen={handleThemeEditorDialogOpen}
        />
        <Toolbar /> {/* AppBarの高さ分のスペーサー */}
        <Box className={classes.content}>
          {isEditorOpen ? (
            <div className={classes.mosaicContainer}>
              <DndProvider backend={HTML5Backend}>
                <Mosaic<MosaicWindowId>
                  value={mosaicLayout}
                  onChange={handleMosaicChange}
                  renderTile={renderMosaicWindow}
                />
                <DropTargetOverlay onFilesDrop={handleFilesDrop} />
              </DndProvider>
            </div>
          ) : (
            <WelcomeScreen onCreateNew={handleCreateNew} />
          )}
        </Box>
        
        <NotificationSnackbar
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={handleNotificationClose}
        />
        
        <ShortcutHelpDialog
          open={isHelpDialogOpen}
          onClose={handleHelpDialogClose}
        />
        
        <TemplateSelectionDialog
          open={isTemplateDialogOpen}
          onClose={handleTemplateDialogClose}
          onSelect={handleTemplateSelect}
          onCreateEmpty={handleCreateEmptyFile}
        />
        
        <TemplateManagementDialog
          open={isTemplateManagementDialogOpen}
          onClose={handleTemplateManagementDialogClose}
        />
        
        <ThemeEditorDialog
          open={isThemeEditorDialogOpen}
          onClose={handleThemeEditorDialogClose}
          currentTheme={settings?.ui.theme || {
            mode: 'preset',
            presetTheme: 'default-light',
            customThemeId: null,
            autoSwitchMode: 'system',
            switchTimes: {
              lightTheme: '06:00',
              darkTheme: '18:00',
            },
          }}
          onThemeChange={handleThemeEditorChange}
          onThemeApply={handleThemeEditorApply}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
