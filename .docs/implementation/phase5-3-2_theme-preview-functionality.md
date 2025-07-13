# フェーズ5-3-2: テーマプレビュー機能実装

## 実装概要

テーマエディタダイアログにおいて、プリセットテーマやカスタムテーマをクリックした際に即座にテーマが切り替わるプレビュー機能を実装しました。また、「テーマを適用」ボタンをクリックした際にのみ設定が永続化される機能も追加し、ユーザビリティを大幅に向上させました。

## 実装背景

### 要求仕様
- **プリセットテーマ選択**: クリックすると即座にテーマが切り替わる
- **ダークモード切り替え**: ToggleButtonで即座にテーマモードが切り替わる  
- **カスタムテーマ選択**: カスタムテーマをクリックすると即座にプレビューが反映される
- **設定の永続化**: 「テーマを適用」ボタンをクリックしたときのみ設定が保存される

### 技術的課題
1. **プレビュー状態の管理**: 一時的なプレビューと永続的な設定の分離
2. **カスタムテーマの非同期処理**: カスタムテーマの動的読み込み
3. **型安全性**: 複雑な状態管理での型安全性の確保
4. **パフォーマンス**: 不要な再計算の回避

## 実装内容

### 1. プレビュー状態管理システム

#### App.tsx での実装
```typescript
// プレビュー用テーマ状態（テーマエディタ用）
const [previewTheme, setPreviewTheme] = useState<ThemeSettings | null>(null)

// カスタムテーマキャッシュ
const [customThemeCache, setCustomThemeCache] = useState<Map<string, CustomTheme>>(new Map())

// 解決されたカスタムテーマの状態
const [resolvedCustomTheme, setResolvedCustomTheme] = useState<CustomTheme | null>(null)
```

#### テーマ生成ロジックの拡張
```typescript
// テーマ設定に基づいてテーマを動的に生成
const currentTheme = useMemo(() => {
  try {
    // プレビューテーマが設定されている場合は優先
    const themeSettings = previewTheme || settings?.ui.theme
    
    if (!themeSettings) {
      return createAppTheme('light')
    }
    
    // 新しいテーマシステムでの処理
    if (themeSettings.mode) {
      if (themeSettings.mode === 'preset' && themeSettings.presetTheme) {
        let themeMode: 'light' | 'dark' = 'light'
        
        // テーマモードの決定（安全性チェック付き）
        if (themeSettings.themeMode === 'system') {
          const systemMode = resolveThemeMode('system')
          themeMode = systemMode === 'dark' ? 'dark' : 'light'
        } else if (themeSettings.themeMode === 'light' || themeSettings.themeMode === 'dark') {
          themeMode = themeSettings.themeMode
        } else {
          console.warn('Invalid themeMode:', themeSettings.themeMode, 'Falling back to light')
          themeMode = 'light'
        }
        
        return createPresetTheme(themeSettings.presetTheme, themeMode)
      }
      
      if (themeSettings.mode === 'custom' && resolvedCustomTheme) {
        // カスタムテーマが解決されている場合
        let themeMode: 'light' | 'dark' = 'light'
        
        if (themeSettings.themeMode === 'system') {
          const systemMode = resolveThemeMode('system')
          themeMode = systemMode === 'dark' ? 'dark' : 'light'
        } else if (themeSettings.themeMode === 'light' || themeSettings.themeMode === 'dark') {
          themeMode = themeSettings.themeMode
        } else {
          console.warn('Invalid themeMode for custom theme:', themeSettings.themeMode, 'Falling back to light')
          themeMode = 'light'
        }
        
        return createCustomTheme(resolvedCustomTheme, themeMode)
      }
    }
    
    // 後方互換性のサポート
    return createAppTheme(settings?.ui.themeMode || 'system')
  } catch (error) {
    console.error('Error creating theme:', error)
    return createAppTheme('light')
  }
}, [settings, previewTheme, resolvedCustomTheme])
```

### 2. カスタムテーマ処理システム

#### カスタムテーマ取得機能
```typescript
// カスタムテーマ取得関数
const getCustomTheme = useCallback(async (themeId: string) => {
  try {
    // キャッシュから取得を試す
    if (customThemeCache.has(themeId)) {
      return customThemeCache.get(themeId)
    }
    
    // APIから取得
    const themes = await window.electronAPI.themes.getAll()
    const theme = themes.find(t => t.id === themeId)
    
    if (theme) {
      // キャッシュに保存
      setCustomThemeCache(prev => new Map(prev).set(themeId, theme))
      return theme
    }
    
    return null
  } catch (error) {
    console.error('Failed to get custom theme:', error)
    return null
  }
}, [customThemeCache])
```

#### カスタムテーマ解決処理
```typescript
// カスタムテーマの解決
useEffect(() => {
  const resolveCustomTheme = async () => {
    const themeSettings = previewTheme || settings?.ui.theme
    
    if (themeSettings?.mode === 'custom' && themeSettings.customThemeId) {
      try {
        const customTheme = await getCustomTheme(themeSettings.customThemeId)
        setResolvedCustomTheme(customTheme || null)
      } catch (error) {
        console.error('Failed to resolve custom theme:', error)
        setResolvedCustomTheme(null)
      }
    } else {
      setResolvedCustomTheme(null)
    }
  }
  
  resolveCustomTheme()
}, [previewTheme, settings, getCustomTheme])
```

### 3. プレビュー機能の実装

#### プレビュー用テーマ変更処理
```typescript
// テーマエディタからのテーマ変更処理（プレビュー用）
const handleThemeEditorChange = (theme: ThemeSettings) => {
  console.log('ThemeEditorChange (Preview):', theme)
  // プレビュー用テーマを設定（即座に反映）
  setPreviewTheme(theme)
}
```

#### 設定の永続化処理
```typescript
// テーマエディタからのテーマ適用処理（設定保存）
const handleThemeEditorApply = async (theme: ThemeSettings) => {
  if (!updateUISettings) return
  
  try {
    // テーマモードも適切に更新
    const themeMode: 'light' | 'dark' | 'system' = theme.themeMode
    
    await updateUISettings({ 
      theme,
      themeMode  // 後方互換性のため
    })
    
    // プレビューをリセット（設定が保存されたため）
    setPreviewTheme(null)
    
    showNotification(t('notification.themeChanged', { theme: theme.mode === 'preset' ? theme.presetTheme : 'custom' }), 'success')
  } catch (error) {
    showNotification(t('notification.themeChangeError', { error: error instanceof Error ? error.message : String(error) }), 'error')
  }
}
```

#### ダイアログクローズ処理
```typescript
const handleThemeEditorDialogClose = () => {
  setIsThemeEditorDialogOpen(false)
  // ダイアログを閉じる際にプレビューをリセット
  setPreviewTheme(null)
  // カスタムテーマのキャッシュもクリア（メモリ効率のため）
  setCustomThemeCache(new Map())
  setResolvedCustomTheme(null)
}
```

### 4. ThemeEditorDialog の機能拡張

#### カスタムテーマ選択処理の追加
```typescript
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
```

#### UI の更新
```typescript
// カスタムテーマリストの更新
<ListItem
  key={theme.id}
  onClick={() => handleCustomThemeSelect(theme)}  // 新しいハンドラーを使用
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
</ListItem>
```

### 5. カスタムテーマ作成機能

#### theme.ts での実装
```typescript
// カスタムテーマからMUIテーマを作成
export const createCustomTheme = (customTheme: CustomTheme, mode: 'light' | 'dark'): Theme => {
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
```

## 修正されたファイル一覧

### コアファイル（3ファイル）
1. **src/App.tsx**: プレビュー状態管理システムの実装
2. **src/components/ThemeEditorDialog.tsx**: カスタムテーマ選択処理の追加
3. **src/theme.ts**: カスタムテーマ作成機能の実装

## 技術的な実装詳細

### 1. 状態管理アーキテクチャ
- **プレビュー状態の分離**: 一時的なプレビューと永続的な設定の明確な分離
- **キャッシュ機能**: カスタムテーマの効率的な管理
- **非同期処理**: カスタムテーマの安全な非同期読み込み

### 2. パフォーマンス最適化
- **メモ化の活用**: useMemo による不要な再計算の回避
- **キャッシュシステム**: Map によるカスタムテーマの効率的な管理
- **メモリ効率**: ダイアログクローズ時のキャッシュクリア

### 3. 型安全性の確保
- **完全なTypeScript対応**: 全ての状態に対する型定義
- **エラーハンドリング**: 型チェックによる安全な処理
- **null安全性**: 適切な null チェック

### 4. ユーザビリティの向上
- **即座のフィードバック**: プレビューの即時反映
- **直感的な操作**: 明確な操作フロー
- **メモリ効率**: 不要なリソースの適切な解放

## 品質保証

### 完了した品質チェック
- ✅ **TypeScriptコンパイル**: 全てのエラーを解決
- ✅ **プレビュー機能**: 即座のテーマ切り替えを確認
- ✅ **設定永続化**: 「適用」ボタンでの設定保存を確認
- ✅ **カスタムテーマ**: カスタムテーマ選択の動作確認
- ✅ **メモリ効率**: キャッシュクリアの動作確認

### 動作確認項目
- [x] プリセットテーマクリック時の即座プレビュー
- [x] ダークモード切り替えの即座プレビュー
- [x] カスタムテーマクリック時の即座プレビュー
- [x] 「テーマを適用」ボタンでの設定保存
- [x] ダイアログクローズ時のプレビューリセット
- [x] カスタムテーマの非同期読み込み
- [x] エラー時のフォールバック動作

## 得られた成果

### 1. ユーザビリティの大幅向上
- **即座のフィードバック**: プレビューの即時反映
- **直感的な操作**: 明確で分かりやすい操作フロー
- **安全な操作**: 誤った操作を防ぐ設計

### 2. 技術的な改善
- **パフォーマンス**: 効率的な状態管理とキャッシュ
- **型安全性**: 完全なTypeScript対応
- **保守性**: 明確な責任分離

### 3. 機能の完全性
- **包括的なプレビュー**: 全テーマタイプに対応
- **設定管理**: 適切な永続化機能
- **エラー処理**: 堅牢なエラーハンドリング

### 4. 開発効率の向上
- **再利用可能なコンポーネント**: 拡張しやすい設計
- **デバッグ機能**: 問題の早期発見
- **文書化**: 実装の理解が容易

## 今後の拡張可能性

### 短期的な改善
1. **アニメーション**: テーマ切り替え時のスムーズな遷移
2. **プレビュー範囲**: より多くのUI要素でのプレビュー
3. **ショートカット**: キーボードショートカットでの操作

### 中期的な改善
1. **プレビュー履歴**: 以前のプレビュー状態への戻り機能
2. **比較機能**: 複数テーマの並列比較
3. **自動保存**: 一定時間後の自動適用

### 長期的な改善
1. **リアルタイム編集**: カスタムテーマのリアルタイム編集
2. **インテリジェント提案**: AIによるテーマ提案
3. **協調編集**: 複数ユーザーでのテーマ編集

## 使用方法

### 基本的な使用方法
1. **テーマエディタ起動**: 設定メニュー → テーマエディタ
2. **プレビュー確認**: プリセットテーマをクリック → 即座にプレビュー
3. **モード切り替え**: Light/Dark/System ボタンをクリック → 即座に反映
4. **設定保存**: 「テーマを適用」ボタンをクリック → 設定永続化

### カスタムテーマの使用方法
1. **カスタムテーマタブ**: 「カスタムテーマ」タブをクリック
2. **テーマ選択**: 任意のカスタムテーマをクリック → 即座にプレビュー
3. **設定保存**: 「テーマを適用」ボタンをクリック → 設定永続化

### キャンセル操作
- **ダイアログを閉じる**: 「✕」ボタンまたは「閉じる」ボタン → プレビューリセット
- **プレビューのみ**: 「適用」せずに閉じることでプレビューのみ確認可能

## 実装完了まとめ

### 🎉 フェーズ5-3-2: テーマプレビュー機能実装完了

**実装日**: 2025年1月10日  
**作業内容**: テーマプレビュー機能の完全実装

### 実現された主要機能

#### 1. 即座プレビュー機能
- ✅ **プリセットテーマ**: クリック時の即座プレビュー
- ✅ **ダークモード切り替え**: ToggleButton での即座切り替え
- ✅ **カスタムテーマ**: 選択時の即座プレビュー

#### 2. 設定管理機能
- ✅ **プレビュー状態**: 一時的なプレビュー管理
- ✅ **設定永続化**: 「適用」ボタンでの設定保存
- ✅ **キャッシュ管理**: 効率的なカスタムテーマ管理

#### 3. 技術的改善
- ✅ **型安全性**: 完全なTypeScript対応
- ✅ **パフォーマンス**: 最適化された状態管理
- ✅ **エラー処理**: 堅牢なエラーハンドリング

#### 4. ユーザビリティ
- ✅ **直感的操作**: 明確な操作フロー
- ✅ **即座フィードバック**: プレビューの即時反映
- ✅ **安全な操作**: 誤操作を防ぐ設計

この実装により、**テーマエディタの使いやすさが大幅に向上**し、ユーザーはテーマを選択した瞬間に結果を確認できるようになりました。また、設定は「適用」ボタンを押したときのみ保存されるため、安心してテーマを試すことができます。 