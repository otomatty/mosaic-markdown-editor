import React, { useState, useMemo } from 'react'
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
import theme from './theme'
import AppHeader from './components/AppHeader'
import EditorPanel from './components/EditorPanel'
import PreviewPanel from './components/PreviewPanel'
import WelcomeScreen from './components/WelcomeScreen'
import NotificationSnackbar from './components/NotificationSnackbar'
import DropTargetOverlay from './components/DropTargetOverlay'

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
  
  // Mosaic レイアウトの状態管理
  const [mosaicLayout, setMosaicLayout] = useState<MosaicNode<MosaicWindowId> | null>({
    direction: 'row',
    first: 'editor',
    second: 'preview',
    splitPercentage: 50,
  })
  
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

  const handleFileMenuClose = () => {
    setFileMenuAnchor(null)
  }

  // 通知の表示
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setNotification({ open: true, message, severity })
  }

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  // ファイル操作の実装
  const handleOpenFile = async () => {
    handleFileMenuClose()
    
    try {
      const result = await window.electronAPI.openFile()
      if (result.success && result.content && result.filePath) {
        setFileContent(result.content)
        setCurrentFilePath(result.filePath)
        setHasUnsavedChanges(false)
        setIsEditorOpen(true)
        showNotification(t('notification.fileOpened', { filename: result.filePath }), 'success')
      } else {
        showNotification(t('notification.fileOpenError', { error: result.error || 'Unknown error' }), 'error')
      }
    } catch (error) {
      showNotification(t('notification.fileOpenError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }

  const handleSaveFile = async () => {
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
  }

  const handleSaveAsFile = async () => {
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
  }

  const handleCreateNew = () => {
    handleFileMenuClose()
    
    // ファイル状態をリセット
    setFileContent('')
    setCurrentFilePath(null)
    setHasUnsavedChanges(false)
    setIsEditorOpen(true)
    
    // 新規作成完了の通知
    showNotification(t('notification.newFileCreated'), 'success')
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
      setFileContent(content)
      setCurrentFilePath(file.path || file.name)
      setHasUnsavedChanges(false)
      setIsEditorOpen(true)
      showNotification(t('notification.fileLoaded', { filename: file.name }), 'success')
    } catch (error) {
      showNotification(t('notification.fileLoadError', { error: error instanceof Error ? error.message : String(error) }), 'error')
    }
  }

  // Mosaicレイアウトの変更処理
  const handleMosaicChange = (newLayout: MosaicNode<MosaicWindowId> | null) => {
    setMosaicLayout(newLayout)
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
    <ThemeProvider theme={theme}>
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
      </div>
    </ThemeProvider>
  )
}

export default App
