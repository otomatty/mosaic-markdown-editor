import { createTheme, Theme, PaletteMode } from '@mui/material/styles'
import { grey, blue, red } from '@mui/material/colors'

// テーマモードの型定義
export type ThemeMode = 'light' | 'dark' | 'system'

// プリセットテーマの型定義
export type PresetTheme = 
  | 'default'
  | 'github'
  | 'vscode'
  | 'solarized'
  | 'one-dark'
  | 'monokai'
  | 'atom'

// カラーパレットの型定義
export interface ThemeColorPalette {
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

export interface ThemeColors {
  light: ThemeColorPalette
  dark: ThemeColorPalette
}

// プリセットテーマのカラーパレット定義
export const presetThemeColors: Record<PresetTheme, ThemeColors> = {
  'default': {
    light: {
      primary: blue[600],
      secondary: red[600],
      background: '#fafafa',
      paper: '#ffffff',
      textPrimary: grey[900],
      textSecondary: grey[700],
      appBar: blue[600],
      border: grey[300],
      editorBackground: '#ffffff',
      editorBorder: grey[300],
    },
    dark: {
      primary: blue[400],
      secondary: red[400],
      background: '#121212',
      paper: '#1e1e1e',
      textPrimary: '#ffffff',
      textSecondary: grey[400],
      appBar: '#1e1e1e',
      border: grey[800],
      editorBackground: '#2a2a2a',
      editorBorder: grey[700],
    },
  },
  'github': {
    light: {
      primary: '#0366d6',
      secondary: '#d73a49',
      background: '#ffffff',
      paper: '#f6f8fa',
      textPrimary: '#24292e',
      textSecondary: '#586069',
      appBar: '#24292e',
      border: '#e1e4e8',
      editorBackground: '#ffffff',
      editorBorder: '#e1e4e8',
    },
    dark: {
      primary: '#58a6ff',
      secondary: '#f85149',
      background: '#0d1117',
      paper: '#161b22',
      textPrimary: '#c9d1d9',
      textSecondary: '#8b949e',
      appBar: '#21262d',
      border: '#30363d',
      editorBackground: '#0d1117',
      editorBorder: '#21262d',
    },
  },
  'vscode': {
    light: {
      primary: '#0078d4',
      secondary: '#e8ab00',
      background: '#ffffff',
      paper: '#f3f3f3',
      textPrimary: '#323130',
      textSecondary: '#605e5c',
      appBar: '#2c2c2c',
      border: '#e5e5e5',
      editorBackground: '#ffffff',
      editorBorder: '#e5e5e5',
    },
    dark: {
      primary: '#0e639c',
      secondary: '#dcdcaa',
      background: '#1e1e1e',
      paper: '#252526',
      textPrimary: '#cccccc',
      textSecondary: '#969696',
      appBar: '#2d2d30',
      border: '#3e3e42',
      editorBackground: '#1e1e1e',
      editorBorder: '#3e3e42',
    },
  },
  'solarized': {
    light: {
      primary: '#268bd2',
      secondary: '#dc322f',
      background: '#fdf6e3',
      paper: '#eee8d5',
      textPrimary: '#657b83',
      textSecondary: '#839496',
      appBar: '#586e75',
      border: '#93a1a1',
      editorBackground: '#fdf6e3',
      editorBorder: '#93a1a1',
    },
    dark: {
      primary: '#268bd2',
      secondary: '#dc322f',
      background: '#002b36',
      paper: '#073642',
      textPrimary: '#839496',
      textSecondary: '#657b83',
      appBar: '#073642',
      border: '#586e75',
      editorBackground: '#002b36',
      editorBorder: '#586e75',
    },
  },
  'one-dark': {
    light: {
      primary: '#61afef',
      secondary: '#e06c75',
      background: '#fafafa',
      paper: '#ffffff',
      textPrimary: '#333333',
      textSecondary: '#666666',
      appBar: '#f5f5f5',
      border: '#e0e0e0',
      editorBackground: '#ffffff',
      editorBorder: '#e0e0e0',
    },
    dark: {
      primary: '#61afef',
      secondary: '#e06c75',
      background: '#282c34',
      paper: '#21252b',
      textPrimary: '#abb2bf',
      textSecondary: '#5c6370',
      appBar: '#21252b',
      border: '#3e4451',
      editorBackground: '#282c34',
      editorBorder: '#3e4451',
    },
  },
  'monokai': {
    light: {
      primary: '#66d9ef',
      secondary: '#f92672',
      background: '#fafafa',
      paper: '#ffffff',
      textPrimary: '#333333',
      textSecondary: '#666666',
      appBar: '#f5f5f5',
      border: '#e0e0e0',
      editorBackground: '#ffffff',
      editorBorder: '#e0e0e0',
    },
    dark: {
      primary: '#66d9ef',
      secondary: '#f92672',
      background: '#272822',
      paper: '#3e3d32',
      textPrimary: '#f8f8f2',
      textSecondary: '#75715e',
      appBar: '#3e3d32',
      border: '#49483e',
      editorBackground: '#272822',
      editorBorder: '#49483e',
    },
  },
  'atom': {
    light: {
      primary: '#4078c0',
      secondary: '#d73a49',
      background: '#ffffff',
      paper: '#f7f7f7',
      textPrimary: '#333333',
      textSecondary: '#666666',
      appBar: '#f7f7f7',
      border: '#ddd',
      editorBackground: '#ffffff',
      editorBorder: '#ddd',
    },
    dark: {
      primary: '#7aa6da',
      secondary: '#cc6666',
      background: '#1d1f21',
      paper: '#373b41',
      textPrimary: '#c5c8c6',
      textSecondary: '#969896',
      appBar: '#373b41',
      border: '#282a2e',
      editorBackground: '#1d1f21',
      editorBorder: '#282a2e',
    },
  },
}

// プリセットテーマの表示名
export const presetThemeDisplayNames: Record<PresetTheme, string> = {
  'default': 'Default',
  'github': 'GitHub',
  'vscode': 'VS Code',
  'solarized': 'Solarized',
  'one-dark': 'One Dark',
  'monokai': 'Monokai',
  'atom': 'Atom',
}

// システムのダークモード設定を検出
export const getSystemThemeMode = (): PaletteMode => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light' // フォールバック
}

// 実際のテーマモードを解決
export const resolveThemeMode = (themeMode: ThemeMode): PaletteMode => {
  if (themeMode === 'system') {
    return getSystemThemeMode()
  }
  return themeMode as PaletteMode
}

// プリセットテーマからMUIテーマを作成
export const createPresetTheme = (presetTheme: PresetTheme, mode: 'light' | 'dark'): Theme => {
  const colors = presetThemeColors[presetTheme][mode]
  const isDark = mode === 'dark'
  
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: colors.primary,
        light: colors.primary,
        dark: colors.primary,
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondary,
        dark: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.paper,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.border,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.appBar,
            borderBottom: `1px solid ${colors.border}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.paper,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.editorBackground,
              '& fieldset': {
                borderColor: colors.editorBorder,
              },
              '&:hover fieldset': {
                borderColor: colors.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary,
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.paper,
            color: colors.textPrimary,
          },
        },
      },
    },
  })
}

// カスタムテーマからMUIテーマを作成
export const createCustomTheme = (customTheme: import('./types/electron').CustomTheme, mode: 'light' | 'dark'): Theme => {
  const colors = customTheme.colors
  const isDark = mode === 'dark'
  
  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: colors.primary,
        light: colors.primary,
        dark: colors.primary,
      },
      secondary: {
        main: colors.secondary,
        light: colors.secondary,
        dark: colors.secondary,
      },
      background: {
        default: colors.background,
        paper: colors.paper,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
      divider: colors.border,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.appBar,
            borderBottom: `1px solid ${colors.border}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.paper,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: colors.editorBackground,
              '& fieldset': {
                borderColor: colors.editorBorder,
              },
              '&:hover fieldset': {
                borderColor: colors.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary,
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.paper,
            color: colors.textPrimary,
          },
        },
      },
    },
  })
}

// ライトテーマの作成（後方互換性） 
export const createLightTheme = (): Theme => createPresetTheme('default', 'light')

// ダークテーマの作成（後方互換性）
export const createDarkTheme = (): Theme => createPresetTheme('default', 'dark')

// テーマモードに基づいてテーマを作成（後方互換性）
export const createAppTheme = (themeMode: ThemeMode): Theme => {
  const resolvedMode = resolveThemeMode(themeMode)
  return resolvedMode === 'dark' ? createDarkTheme() : createLightTheme()
}

// 新しいプリセットテーマに基づいてテーマを作成
export const createThemeFromPreset = (presetTheme: PresetTheme, mode: 'light' | 'dark' = 'light'): Theme => {
  return createPresetTheme(presetTheme, mode)
}

// プリセットテーマ一覧を取得
export const getAvailablePresetThemes = (): PresetTheme[] => {
  return Object.keys(presetThemeColors) as PresetTheme[]
}

// プリセットテーマがダークテーマかどうかを判定（新しいテーマシステムでは不要）
// export const isPresetThemeDark = (presetTheme: PresetTheme): boolean => {
//   return presetTheme.includes('dark') || presetTheme === 'one-dark' || presetTheme === 'monokai'
// }

// デフォルトテーマ（後方互換性）
export const theme = createLightTheme()
export default theme 