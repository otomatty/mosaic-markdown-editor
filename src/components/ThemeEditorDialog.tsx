import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tab,
  Tabs,
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material'
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  Palette as PaletteIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import { 
  PresetTheme, 
  CustomTheme, 
  ThemeSettings,
  CustomThemeOperationResult,
} from '../types/electron'
import { 
  presetThemeColors, 
  presetThemeDisplayNames, 
  getAvailablePresetThemes,
} from '../theme'

const useStyles = makeStyles()((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      maxHeight: '800px',
    },
  },
  content: {
    padding: 0,
    height: '100%',
  },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  tabContent: {
    flex: 1,
    padding: theme.spacing(3),
    overflow: 'auto',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(2),
  },
  presetCard: {
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  selectedPreset: {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.action.selected,
  },
  colorSection: {
    marginBottom: theme.spacing(3),
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing(2),
  },
  colorInput: {
    '& .MuiInputBase-root': {
      paddingLeft: theme.spacing(6),
    },
  },
  colorPreview: {
    position: 'absolute',
    left: theme.spacing(1),
    top: '50%',
    transform: 'translateY(-50%)',
    width: 32,
    height: 32,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    cursor: 'pointer',
  },
  customThemesList: {
    maxHeight: '60vh',
    overflow: 'auto',
  },
  previewContainer: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  previewContent: {
    minHeight: 200,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      margin: `${theme.spacing(1)} 0`,
    },
    '& p': {
      margin: `${theme.spacing(0.5)} 0`,
    },
    '& code': {
      backgroundColor: theme.palette.action.hover,
      padding: '2px 4px',
      borderRadius: 2,
    },
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
}))

interface ThemeEditorDialogProps {
  open: boolean
  onClose: () => void
  currentTheme: ThemeSettings
  onThemeChange: (theme: ThemeSettings) => void
  onThemeApply: (theme: ThemeSettings) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  )
}

const ThemeEditorDialog: React.FC<ThemeEditorDialogProps> = ({
  open,
  onClose,
  currentTheme,
  onThemeChange,
  onThemeApply,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  
  // 状態管理
  const [currentTab, setCurrentTab] = useState(0)
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [selectedPreset, setSelectedPreset] = useState<PresetTheme>(currentTheme.presetTheme)
  const [selectedCustomTheme, setSelectedCustomTheme] = useState<CustomTheme | null>(null)
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(currentTheme.themeMode)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [previewEnabled, setPreviewEnabled] = useState(true)
  
  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: '#ffffff',
      paper: '#f5f5f5',
      textPrimary: '#000000',
      textSecondary: '#666666',
      appBar: '#1976d2',
      border: '#e0e0e0',
      editorBackground: '#ffffff',
      editorBorder: '#e0e0e0',
    },
  })

  // プリセットテーマ一覧
  const presetThemes = useMemo(() => getAvailablePresetThemes(), [])

  // カスタムテーマ読み込み
  const loadCustomThemes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const themes = await window.electronAPI.themes.getAll()
      setCustomThemes(themes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load themes')
    } finally {
      setLoading(false)
    }
  }, [])

  // 初期化
  useEffect(() => {
    if (open) {
      loadCustomThemes()
      setCurrentTab(currentTheme.mode === 'preset' ? 0 : 1)
      setSelectedPreset(currentTheme.presetTheme)
    }
  }, [open, currentTheme, loadCustomThemes])

  // プレビュー用のサンプルMarkdownテキスト
  const sampleMarkdownText = useMemo(() => `# Sample Heading
This is a sample paragraph with **bold text** and *italic text*.

## Code Example
\`\`\`typescript
const message = "Hello, World!";
console.log(message);
\`\`\`

- List item 1
- List item 2
- List item 3

> This is a blockquote
`, [])

  // プレビューHTML生成
  const previewHtml = useMemo(() => {
    if (!previewEnabled) return ''
    
    try {
      marked.setOptions({
        breaks: true,
        gfm: true,
      })
      
      const result = marked(sampleMarkdownText)
      return typeof result === 'string' ? result : ''
    } catch (error) {
      return `<p>Preview error: ${error instanceof Error ? error.message : 'Unknown error'}</p>`
    }
  }, [sampleMarkdownText, previewEnabled])

  // タブ変更
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  // プリセットテーマ選択
  const handlePresetSelect = (preset: PresetTheme) => {
    setSelectedPreset(preset)
    const newTheme: ThemeSettings = {
      mode: 'preset',
      presetTheme: preset,
      customThemeId: null,
      themeMode: themeMode,
      autoSwitchMode: currentTheme.autoSwitchMode,
      switchTimes: currentTheme.switchTimes,
    }
    onThemeChange(newTheme)
  }

  // テーマモード変更
  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode)
    const newTheme: ThemeSettings = {
      mode: currentTheme.mode,
      presetTheme: selectedPreset,
      customThemeId: currentTheme.customThemeId,
      themeMode: mode,
      autoSwitchMode: mode === 'system' ? 'system' : 'off',
      switchTimes: currentTheme.switchTimes,
    }
    onThemeChange(newTheme)
  }

  // カスタムテーマ選択
  const handleCustomThemeSelect = (theme: CustomTheme) => {
    setSelectedCustomTheme(theme)
    const newTheme: ThemeSettings = {
      mode: 'custom',
      presetTheme: currentTheme.presetTheme,
      customThemeId: theme.id,
      themeMode: themeMode,
      autoSwitchMode: currentTheme.autoSwitchMode,
      switchTimes: currentTheme.switchTimes,
    }
    onThemeChange(newTheme)
  }

  // カスタムテーマ作成開始
  const handleCreateCustomTheme = () => {
    setIsCreating(true)
    setIsEditing(true)
    setEditingTheme(null)
    setFormData({
      name: '',
      description: '',
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#ffffff',
        paper: '#f5f5f5',
        textPrimary: '#000000',
        textSecondary: '#666666',
        appBar: '#1976d2',
        border: '#e0e0e0',
        editorBackground: '#ffffff',
        editorBorder: '#e0e0e0',
      },
    })
  }

  // カスタムテーマ編集開始
  const handleEditCustomTheme = (theme: CustomTheme) => {
    setIsEditing(true)
    setIsCreating(false)
    setEditingTheme(theme)
    setFormData({
      name: theme.name,
      description: theme.description,
      colors: { ...theme.colors },
    })
  }

  // カスタムテーマ保存
  const handleSaveCustomTheme = async () => {
    if (!formData.name.trim()) {
      setError(t('themeEditor.nameRequired'))
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      let result: CustomThemeOperationResult
      
      if (isCreating) {
        result = await window.electronAPI.themes.create({
          name: formData.name.trim(),
          description: formData.description.trim(),
          colors: formData.colors,
          isBuiltIn: false,
        })
      } else if (editingTheme) {
        result = await window.electronAPI.themes.update(editingTheme.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          colors: formData.colors,
        })
      } else {
        throw new Error('Invalid state')
      }
      
      if (result.success) {
        setSuccess(isCreating ? t('themeEditor.createSuccess') : t('themeEditor.updateSuccess'))
        setIsEditing(false)
        setIsCreating(false)
        setEditingTheme(null)
        await loadCustomThemes()
      } else {
        setError(result.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // カスタムテーマ削除
  const handleDeleteCustomTheme = async (theme: CustomTheme) => {
    if (!window.confirm(t('themeEditor.confirmDelete', { name: theme.name }))) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const result = await window.electronAPI.themes.delete(theme.id)
      if (result.success) {
        setSuccess(t('themeEditor.deleteSuccess'))
        await loadCustomThemes()
      } else {
        setError(result.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // カスタムテーマ複製
  const handleDuplicateCustomTheme = async (theme: CustomTheme) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await window.electronAPI.themes.duplicate(theme.id)
      if (result.success) {
        setSuccess(t('themeEditor.duplicateSuccess'))
        await loadCustomThemes()
      } else {
        setError(result.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // カスタムテーマエクスポート
  const handleExportCustomTheme = async (theme: CustomTheme) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await window.electronAPI.themes.exportTheme(theme.id)
      if (result.success) {
        setSuccess(t('themeEditor.exportSuccess'))
      } else {
        setError(result.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // カスタムテーマインポート
  const handleImportCustomTheme = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await window.electronAPI.openFile()
      if (result.success && result.filePath) {
        const importResult = await window.electronAPI.themes.importTheme(result.filePath)
        if (importResult.success) {
          setSuccess(t('themeEditor.importSuccess'))
          await loadCustomThemes()
        } else {
          setError(importResult.error || 'Unknown error')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // 色変更
  const handleColorChange = (colorKey: keyof typeof formData.colors, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
  }

  // 編集キャンセル
  const handleCancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
    setEditingTheme(null)
    setFormData({
      name: '',
      description: '',
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#ffffff',
        paper: '#f5f5f5',
        textPrimary: '#000000',
        textSecondary: '#666666',
        appBar: '#1976d2',
        border: '#e0e0e0',
        editorBackground: '#ffffff',
        editorBorder: '#e0e0e0',
      },
    })
  }

  // テーマ適用
  const handleApplyTheme = () => {
    if (currentTab === 0) {
      // プリセットテーマ
      const newTheme: ThemeSettings = {
        mode: 'preset',
        presetTheme: selectedPreset,
        customThemeId: null,
        themeMode: themeMode,
        autoSwitchMode: themeMode === 'system' ? 'system' : 'off',
        switchTimes: currentTheme.switchTimes,
      }
      onThemeApply(newTheme)
    } else if (selectedCustomTheme) {
      // カスタムテーマ
      const newTheme: ThemeSettings = {
        mode: 'custom',
        presetTheme: currentTheme.presetTheme,
        customThemeId: selectedCustomTheme.id,
        themeMode: themeMode,
        autoSwitchMode: themeMode === 'system' ? 'system' : 'off',
        switchTimes: currentTheme.switchTimes,
      }
      onThemeApply(newTheme)
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      className={classes.dialog}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <PaletteIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{t('themeEditor.title')}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={themeMode}
              exclusive
              onChange={(_, value) => value && handleThemeModeChange(value)}
              size="small"
            >
              <ToggleButton value="light" aria-label="light mode">
                <LightModeIcon />
              </ToggleButton>
              <ToggleButton value="dark" aria-label="dark mode">
                <DarkModeIcon />
              </ToggleButton>
              <ToggleButton value="system" aria-label="system mode">
                <ComputerIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={previewEnabled}
                  onChange={(e) => setPreviewEnabled(e.target.checked)}
                />
              }
              label={t('themeEditor.enablePreview')}
            />
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent className={classes.content}>
        <div className={classes.container}>
          {/* エラー・成功メッセージ */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          {/* タブ */}
          <Box className={classes.tabsContainer}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <Tab label={t('themeEditor.presetThemes')} />
              <Tab label={t('themeEditor.customThemes')} />
            </Tabs>
          </Box>
          
          {/* プリセットテーマタブ */}
          <TabPanel value={currentTab} index={0}>
            <Box className={classes.tabContent}>
              <Typography variant="h6" gutterBottom>
                {t('themeEditor.selectPresetTheme')}
              </Typography>
              
              <div className={classes.presetGrid}>
                {presetThemes.map((preset) => (
                  <Card
                    key={preset}
                    className={`${classes.presetCard} ${
                      selectedPreset === preset ? classes.selectedPreset : ''
                    }`}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {presetThemeDisplayNames[preset]}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {Object.entries(presetThemeColors[preset]).slice(0, 4).map(([key, color]) => (
                          <Box
                            key={key}
                            sx={{
                              width: 24,
                              height: 24,
                              backgroundColor: color,
                              borderRadius: 1,
                              border: 1,
                              borderColor: 'divider',
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* プレビュー */}
              {previewEnabled && (
                <Box className={classes.previewContainer} mt={3}>
                  <Typography variant="h6" gutterBottom>
                    <PreviewIcon sx={{ mr: 1 }} />
                    {t('themeEditor.preview')}
                  </Typography>
                  <div
                    className={classes.previewContent}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </Box>
              )}
            </Box>
          </TabPanel>
          
          {/* カスタムテーマタブ */}
          <TabPanel value={currentTab} index={1}>
            <Box className={classes.tabContent}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('themeEditor.customThemes')}
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCustomTheme}
                    disabled={loading}
                  >
                    {t('themeEditor.createNew')}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ImportIcon />}
                    onClick={handleImportCustomTheme}
                    disabled={loading}
                  >
                    {t('themeEditor.importTheme')}
                  </Button>
                </Box>
              </Box>
              
              {isEditing ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {isCreating ? t('themeEditor.createNewTheme') : t('themeEditor.editTheme')}
                  </Typography>
                  
                  <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                    <Box flex={{ xs: 1, md: 0.5 }}>
                      <TextField
                        fullWidth
                        label={t('themeEditor.themeName')}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        margin="normal"
                      />
                      
                      <TextField
                        fullWidth
                        label={t('themeEditor.themeDescription')}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        multiline
                        rows={3}
                        margin="normal"
                      />
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="h6" gutterBottom>
                        {t('themeEditor.colors')}
                      </Typography>
                      
                      <div className={classes.colorGrid}>
                        {Object.entries(formData.colors).map(([key, value]) => (
                          <Box key={key} position="relative">
                            <TextField
                              fullWidth
                              label={t(`themeEditor.color.${key}`)}
                              value={value}
                              onChange={(e) => handleColorChange(key as keyof typeof formData.colors, e.target.value)}
                              className={classes.colorInput}
                              margin="normal"
                            />
                            <Box
                              className={classes.colorPreview}
                              sx={{ backgroundColor: value }}
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'color'
                                input.value = value
                                input.addEventListener('change', (e) => {
                                  const target = e.target as HTMLInputElement
                                  handleColorChange(key as keyof typeof formData.colors, target.value)
                                })
                                input.click()
                              }}
                            />
                          </Box>
                        ))}
                      </div>
                    </Box>
                    
                    <Box flex={{ xs: 1, md: 0.5 }}>
                      {previewEnabled && (
                        <Box className={classes.previewContainer}>
                          <Typography variant="h6" gutterBottom>
                            <PreviewIcon sx={{ mr: 1 }} />
                            {t('themeEditor.preview')}
                          </Typography>
                          <div
                            className={classes.previewContent}
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Box display="flex" gap={2} mt={3}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveCustomTheme}
                      disabled={loading}
                    >
                      {t('themeEditor.save')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      {t('themeEditor.cancel')}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <List className={classes.customThemesList}>
                    {customThemes.map((theme) => (
                      <ListItem
                        key={theme.id}
                        onClick={() => handleCustomThemeSelect(theme)}
                        sx={{
                          backgroundColor: selectedCustomTheme?.id === theme.id ? 'action.selected' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemText
                          primary={theme.name}
                          secondary={theme.description}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuAnchor(e.currentTarget)
                              setSelectedCustomTheme(theme)
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  {customThemes.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="body2" color="text.secondary">
                        {t('themeEditor.noCustomThemes')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </TabPanel>
        </div>
        
        {/* アクションメニュー */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            if (selectedCustomTheme) {
              handleEditCustomTheme(selectedCustomTheme)
            }
            setMenuAnchor(null)
          }}>
            <EditIcon sx={{ mr: 1 }} />
            {t('themeEditor.edit')}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedCustomTheme) {
              handleDuplicateCustomTheme(selectedCustomTheme)
            }
            setMenuAnchor(null)
          }}>
            <CopyIcon sx={{ mr: 1 }} />
            {t('themeEditor.duplicate')}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedCustomTheme) {
              handleExportCustomTheme(selectedCustomTheme)
            }
            setMenuAnchor(null)
          }}>
            <ExportIcon sx={{ mr: 1 }} />
            {t('themeEditor.export')}
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              if (selectedCustomTheme) {
                handleDeleteCustomTheme(selectedCustomTheme)
              }
              setMenuAnchor(null)
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} />
            {t('themeEditor.delete')}
          </MenuItem>
        </Menu>
        
        {/* ローディングオーバーレイ */}
        {loading && (
          <Box className={classes.loadingOverlay}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('themeEditor.close')}
        </Button>
        <Button
          variant="contained"
          onClick={handleApplyTheme}
          disabled={loading}
        >
          {t('themeEditor.applyTheme')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ThemeEditorDialog 