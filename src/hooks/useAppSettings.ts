import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppSettings } from '../types/electron'
import { MosaicNode } from 'react-mosaic-component'

// Mosaic Window IDの型定義
type MosaicWindowId = 'editor' | 'preview'

// 設定管理フックの戻り値の型
interface UseAppSettingsReturn {
  // 設定データ
  settings: AppSettings | null
  isLoading: boolean
  
  // 設定更新関数
  updateWindowSettings: (settings: Partial<AppSettings['window']>) => Promise<void>
  updateUISettings: (settings: Partial<AppSettings['ui']>) => Promise<void>
  updateFileSettings: (settings: Partial<AppSettings['files']>) => Promise<void>
  
  // 特定の設定項目の更新
  updateLanguage: (language: string) => Promise<void>
  updateMosaicLayout: (layout: MosaicNode<MosaicWindowId> | null) => Promise<void>
  addRecentFile: (filePath: string) => Promise<void>
  
  // 設定のリセット
  resetSettings: () => Promise<void>
  
  // エラー処理
  error: string | null
}

export const useAppSettings = (): UseAppSettingsReturn => {
  const { i18n } = useTranslation()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 設定を読み込む
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const loadedSettings = await window.electronAPI.settings.getAll()
      setSettings(loadedSettings)
      
      // 言語設定を適用
      if (loadedSettings.ui.language !== i18n.language) {
        await i18n.changeLanguage(loadedSettings.ui.language)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settings loading failed')
      console.error('Settings loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [i18n])

  // 初期化時に設定を読み込む
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // 設定を更新する共通関数
  const updateSettings = useCallback(async <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    try {
      setError(null)
      
      const result = await window.electronAPI.settings.set(key, value)
      if (!result.success) {
        throw new Error(result.error || 'Settings update failed')
      }
      
      // ローカル状態を更新
      setSettings(prev => prev ? { ...prev, [key]: value } : null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settings update failed')
      console.error('Settings update error:', err)
    }
  }, [])

  // ウィンドウ設定の更新
  const updateWindowSettings = useCallback(async (windowSettings: Partial<AppSettings['window']>) => {
    if (!settings) return
    
    const newWindowSettings = { ...settings.window, ...windowSettings }
    await updateSettings('window', newWindowSettings)
  }, [settings, updateSettings])

  // UI設定の更新
  const updateUISettings = useCallback(async (uiSettings: Partial<AppSettings['ui']>) => {
    if (!settings) return
    
    const newUISettings = { ...settings.ui, ...uiSettings }
    await updateSettings('ui', newUISettings)
  }, [settings, updateSettings])

  // ファイル設定の更新
  const updateFileSettings = useCallback(async (fileSettings: Partial<AppSettings['files']>) => {
    if (!settings) return
    
    const newFileSettings = { ...settings.files, ...fileSettings }
    await updateSettings('files', newFileSettings)
  }, [settings, updateSettings])

  // 言語設定の更新
  const updateLanguage = useCallback(async (language: string) => {
    if (!settings) return
    
    try {
      // i18nの言語を変更
      await i18n.changeLanguage(language)
      
      // 設定を保存
      await updateUISettings({ language })
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Language update failed')
      console.error('Language update error:', err)
    }
  }, [settings, updateUISettings, i18n])

  // Mosaicレイアウトの更新
  const updateMosaicLayout = useCallback(async (layout: MosaicNode<MosaicWindowId> | null) => {
    if (!settings) return
    
    await updateUISettings({ mosaicLayout: layout })
  }, [settings, updateUISettings])

  // 最近開いたファイルの追加
  const addRecentFile = useCallback(async (filePath: string) => {
    if (!settings) return
    
    const currentRecentFiles = settings.files.recentFiles
    const maxRecentFiles = settings.files.maxRecentFiles
    
    // 重複を削除して先頭に追加
    const updatedRecentFiles = [filePath, ...currentRecentFiles.filter(f => f !== filePath)]
      .slice(0, maxRecentFiles)
    
    await updateFileSettings({ recentFiles: updatedRecentFiles })
  }, [settings, updateFileSettings])

  // 設定のリセット
  const resetSettings = useCallback(async () => {
    try {
      setError(null)
      
      const result = await window.electronAPI.settings.reset()
      if (!result.success) {
        throw new Error(result.error || 'Settings reset failed')
      }
      
      // 設定を再読み込み
      await loadSettings()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settings reset failed')
      console.error('Settings reset error:', err)
    }
  }, [loadSettings])

  return {
    settings,
    isLoading,
    error,
    updateWindowSettings,
    updateUISettings,
    updateFileSettings,
    updateLanguage,
    updateMosaicLayout,
    addRecentFile,
    resetSettings,
  }
}