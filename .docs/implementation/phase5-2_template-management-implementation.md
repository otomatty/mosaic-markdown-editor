# フェーズ5-2: テンプレート管理機能の実装

## 実装概要

Phase 5-1で実装したテンプレート選択機能に続き、テンプレートの作成・編集・削除機能を提供するテンプレート管理ダイアログを実装します。ユーザーが直感的にテンプレートを管理できる完全なCRUD機能を提供し、生産性を更に向上させます。

## 実装対象

### 1. テンプレート管理ダイアログ
- Material-UIを使用した本格的な管理ダイアログ
- 3つの表示モード（一覧・編集・プレビュー）
- サイドバー + コンテンツエリアのレイアウト
- レスポンシブデザイン対応

### 2. CRUD機能
- **作成（Create）**: 新しいテンプレートの作成
- **読み取り（Read）**: テンプレート一覧表示・詳細表示
- **更新（Update）**: 既存テンプレートの編集
- **削除（Delete）**: 不要なテンプレートの削除

### 3. 検索・フィルタリング
- 名前・説明・タグでの包括的検索
- カテゴリ別フィルタリング
- リアルタイム検索結果更新

### 4. プレビュー機能
- リアルタイムMarkdownプレビュー
- 編集中のリアルタイムプレビュー
- 型安全なMarkdown解析

### 5. UI/UX統合
- AppHeaderの設定メニューからアクセス
- 完全な国際化対応（日本語・英語）
- 通知システムとの連携

## 実装計画

### Step 1: TemplateManagementDialogコンポーネント設計
- 3つの表示モード設計
- サイドバー + コンテンツエリアのレイアウト
- TSS-Reactによるスタイリング

### Step 2: CRUD機能実装
- テンプレート作成フォーム
- テンプレート編集フォーム
- 削除確認ダイアログ
- エラーハンドリング

### Step 3: 検索・フィルタリング機能
- 検索機能の実装
- カテゴリフィルタリング
- リアルタイム検索

### Step 4: プレビュー機能
- Markdownプレビュー実装
- リアルタイムプレビュー
- エラーハンドリング

### Step 5: UI統合
- AppHeaderメニュー統合
- App.tsxでの状態管理
- 国際化対応

## 実装状況

### 現在の状況
- [x] Step 1: TemplateManagementDialogコンポーネント設計
- [x] Step 2: CRUD機能実装
- [x] Step 3: 検索・フィルタリング機能
- [x] Step 4: プレビュー機能
- [x] Step 5: UI統合

### 完了した作業
- ✅ TemplateManagementDialog.tsx（736行）の実装
- ✅ 3つの表示モード（list、form、preview）
- ✅ サイドバー + コンテンツエリアレイアウト
- ✅ 完全なCRUD機能（作成・読み取り・更新・削除）
- ✅ 検索・フィルタリング機能
- ✅ リアルタイムMarkdownプレビュー
- ✅ AppHeader設定メニューへの統合
- ✅ App.tsxでの状態管理統合
- ✅ 完全な国際化対応（日本語・英語）
- ✅ TSS-Reactによるスタイリング
- ✅ エラーハンドリング・通知システム

## 実装詳細

### TemplateManagementDialogコンポーネント構造

```typescript
interface TemplateManagementDialogProps {
  open: boolean
  onClose: () => void
}

interface TemplateFormData {
  name: string
  description: string
  category: TemplateCategory
  content: string
  tags: string[]
}

type ViewMode = 'list' | 'form' | 'preview'
```

### 状態管理

```typescript
const [templates, setTemplates] = useState<Template[]>([])
const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
const [viewMode, setViewMode] = useState<ViewMode>('list')
const [searchQuery, setSearchQuery] = useState('')
const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
const [isEditing, setIsEditing] = useState(false)
const [isCreating, setIsCreating] = useState(false)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [success, setSuccess] = useState<string | null>(null)
```

### CRUD機能実装

#### 1. 作成（Create）
```typescript
const handleCreateNew = () => {
  setFormData({
    name: '',
    description: '',
    category: 'general',
    content: '',
    tags: [],
  })
  setSelectedTemplate(null)
  setViewMode('form')
  setIsCreating(true)
  setIsEditing(false)
}

const handleSave = async () => {
  if (!formData.name.trim()) {
    setError(t('templateManagement.nameRequired'))
    return
  }

  const templateData = {
    name: formData.name.trim(),
    description: formData.description.trim(),
    category: formData.category,
    content: formData.content,
    tags: formData.tags,
    isBuiltIn: false,
  }

  const result = await window.electronAPI.templates.create(templateData)
  if (result.success) {
    setSuccess(t('templateManagement.createSuccess'))
    loadTemplates()
    setViewMode('list')
  }
}
```

#### 2. 読み取り（Read）
```typescript
const loadTemplates = useCallback(async () => {
  try {
    setLoading(true)
    setError(null)
    const templateList = await window.electronAPI.templates.getAll()
    setTemplates(templateList)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load templates')
  } finally {
    setLoading(false)
  }
}, [])
```

#### 3. 更新（Update）
```typescript
const handleEdit = (template: Template) => {
  setFormData({
    name: template.name,
    description: template.description,
    category: template.category,
    content: template.content,
    tags: template.tags,
  })
  setSelectedTemplate(template)
  setViewMode('form')
  setIsEditing(true)
  setIsCreating(false)
}
```

#### 4. 削除（Delete）
```typescript
const handleDelete = async (template: Template) => {
  if (!window.confirm(t('templateManagement.confirmDelete', { name: template.name }))) {
    return
  }

  try {
    setLoading(true)
    const result = await window.electronAPI.templates.delete(template.id)
    if (result.success) {
      setSuccess(t('templateManagement.deleteSuccess'))
      loadTemplates()
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null)
        setViewMode('list')
      }
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to delete template')
  } finally {
    setLoading(false)
  }
}
```

### 検索・フィルタリング機能

```typescript
const filteredTemplates = useMemo(() => {
  return templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
}, [templates, searchQuery, selectedCategory])
```

### プレビュー機能

```typescript
const previewHtml = useMemo(() => {
  const content = selectedTemplate?.content || formData.content
  if (!content) return ''
  
  try {
    marked.setOptions({
      breaks: true,
      gfm: true,
    })
    
    const result = marked(content)
    return typeof result === 'string' ? result : ''
  } catch (error) {
    return `<p>Preview error: ${error instanceof Error ? error.message : 'Unknown error'}</p>`
  }
}, [selectedTemplate?.content, formData.content])
```

### AppHeader統合

```typescript
// AppHeader.tsx
interface AppHeaderProps {
  // ... 既存のprops
  onTemplateManagementOpen?: () => void
}

// 設定メニューにテンプレート管理を追加
<Menu
  anchorEl={settingsMenuAnchor}
  open={Boolean(settingsMenuAnchor)}
  onClose={handleSettingsMenuClose}
>
  {onTemplateManagementOpen && (
    <MenuItem onClick={() => { onTemplateManagementOpen(); handleSettingsMenuClose(); }}>
      <SettingsIcon sx={{ mr: 1 }} />
      {t('menu.templateManagement')}
    </MenuItem>
  )}
  {/* ... その他のメニュー項目 */}
</Menu>
```

### App.tsx統合

```typescript
// App.tsx
const [isTemplateManagementDialogOpen, setIsTemplateManagementDialogOpen] = useState<boolean>(false)

const handleTemplateManagementDialogOpen = () => {
  setIsTemplateManagementDialogOpen(true)
}

const handleTemplateManagementDialogClose = () => {
  setIsTemplateManagementDialogOpen(false)
}

// AppHeaderにpropsを渡す
<AppHeader
  // ... 既存のprops
  onTemplateManagementOpen={handleTemplateManagementDialogOpen}
/>

// ダイアログを追加
<TemplateManagementDialog
  open={isTemplateManagementDialogOpen}
  onClose={handleTemplateManagementDialogClose}
/>
```

## 実装の特徴

### UI/UXの特徴
- **直感的な操作**: 3つの表示モードによる明確な操作フロー
- **効率的なレイアウト**: サイドバー + コンテンツエリアの2パネル構成
- **レスポンシブデザイン**: 様々な画面サイズに対応
- **リアルタイム更新**: 検索・フィルタリングの即座反映

### 技術的な特徴
- **型安全性**: 完全なTypeScript対応
- **コンポーネント設計**: 単一責任の原則に基づく設計
- **状態管理**: React Hooksによる効率的な状態管理
- **エラーハンドリング**: 包括的なエラー処理とユーザー通知

### パフォーマンスの特徴
- **メモ化**: useMemoによる検索結果の最適化
- **遅延読み込み**: ダイアログ表示時のデータ読み込み
- **効率的な描画**: 必要最小限の再描画

### 国際化対応
- **完全な多言語対応**: 日本語・英語の完全対応
- **動的翻訳**: 翻訳キーの動的参照
- **一貫性**: 既存のi18nシステムとの統合

## 実装予定ファイル

### 新規作成ファイル
- `src/components/TemplateManagementDialog.tsx`: テンプレート管理ダイアログ（736行）

### 拡張ファイル
- `src/components/AppHeader/AppHeader.tsx`: 設定メニュー拡張
- `src/App.tsx`: テンプレート管理ダイアログ統合
- `src/i18n/locales/ja.json`: 日本語翻訳追加
- `src/i18n/locales/en.json`: 英語翻訳追加

## 注意事項

### 開発時の注意点
1. **Material-UIバージョン**: 新しいAPIとの互換性
2. **TypeScriptエラー**: 型安全性の確保
3. **パフォーマンス**: 大量テンプレート時の処理
4. **メモリリーク**: イベントリスナーの適切な削除

### 運用時の注意点
1. **データバリデーション**: 入力値の検証
2. **エラーハンドリング**: 適切なエラー処理
3. **ユーザビリティ**: 直感的な操作の提供
4. **アクセシビリティ**: キーボード操作対応

### 将来の拡張性
1. **テンプレート共有**: インポート・エクスポート機能
2. **テンプレート変数**: 動的変数置換機能
3. **テンプレート分類**: より詳細なカテゴリ分類
4. **テンプレート検索**: より高度な検索機能

## 実装完了まとめ

### 🎉 フェーズ5-2: テンプレート管理機能の実装完了

**実装日**: 2025年1月10日  
**実装内容**: 生産性向上のためのテンプレート管理機能の完全実装

### 実装した主要機能

#### 1. TemplateManagementDialogコンポーネント（736行）
- ✅ 3つの表示モード（一覧・編集・プレビュー）
- ✅ サイドバー + コンテンツエリアレイアウト
- ✅ Material-UIによる統一されたデザイン
- ✅ TSS-Reactによる型安全なスタイリング

#### 2. 完全なCRUD機能
- ✅ **作成（Create）**: 新しいテンプレートの作成
- ✅ **読み取り（Read）**: テンプレート一覧表示・詳細表示
- ✅ **更新（Update）**: 既存テンプレートの編集
- ✅ **削除（Delete）**: 確認ダイアログ付き削除

#### 3. 検索・フィルタリング機能
- ✅ 名前・説明・タグでの包括的検索
- ✅ 8つのカテゴリでのフィルタリング
- ✅ リアルタイム検索結果更新
- ✅ 効率的な検索アルゴリズム

#### 4. プレビュー機能
- ✅ リアルタイムMarkdownプレビュー
- ✅ 編集中のリアルタイムプレビュー
- ✅ 型安全なMarkdown解析
- ✅ エラーハンドリング

#### 5. UI統合
- ✅ AppHeaderの設定メニュー統合
- ✅ App.tsxでの状態管理
- ✅ 完全な国際化対応（日本語・英語）
- ✅ 通知システムとの連携

### 技術的な実装詳細

#### 使用技術
- **React**: 関数コンポーネント + Hooks
- **TypeScript**: 完全な型安全性
- **Material-UI**: 統一されたデザインシステム
- **TSS-React**: 型安全なスタイリング
- **marked**: Markdownプレビュー
- **react-i18next**: 国際化対応

#### コンポーネント設計
- **単一責任の原則**: 各機能の明確な分離
- **型安全性**: 完全なTypeScript型定義
- **再利用性**: 汎用的なコンポーネント設計
- **拡張性**: 将来の機能追加に対応

#### 状態管理
- **React Hooks**: useState、useEffect、useMemo、useCallback
- **ローカル状態**: コンポーネント内での効率的な管理
- **エラーハンドリング**: 包括的なエラー処理
- **通知システム**: 成功・エラー・警告の通知

### 品質保証

#### 完了した品質チェック
- ✅ TypeScriptコンパイル: エラーなし
- ✅ 型安全性: 完全な型定義
- ✅ 機能動作確認: 全機能正常動作
- ✅ 国際化テスト: 日英切り替え確認
- ✅ レスポンシブテスト: 画面サイズ対応確認

#### 動作確認項目
- [x] 設定メニューからテンプレート管理ダイアログ表示
- [x] テンプレート一覧表示
- [x] 新規テンプレート作成
- [x] 既存テンプレート編集
- [x] テンプレート削除（確認ダイアログ付き）
- [x] 検索機能（名前・説明・タグ）
- [x] カテゴリフィルタリング
- [x] リアルタイムプレビュー
- [x] 言語切り替え時の翻訳更新
- [x] エラーハンドリング・通知表示

### 実現された機能

#### 基本機能
1. **テンプレート管理**: 設定メニューからアクセス可能
2. **CRUD操作**: 作成・読み取り・更新・削除の完全対応
3. **検索機能**: 名前・説明・タグでの包括的検索
4. **カテゴリ分類**: 8つのカテゴリでの整理
5. **プレビュー**: リアルタイムMarkdownプレビュー

#### 使用方法
- **アクセス**: 設定 > テンプレート管理
- **作成**: 右下のFABボタンで新規作成
- **編集**: テンプレート選択後の編集ボタン
- **削除**: テンプレート選択後の削除ボタン
- **検索**: 検索ボックスでリアルタイム検索
- **フィルタ**: カテゴリドロップダウンでフィルタリング

### 残りのタスク

#### 基本機能の完了により実現
1. **完全なテンプレート管理**: 作成・編集・削除の完全対応
2. **直感的な操作**: 3つの表示モードによる明確な操作フロー
3. **効率的な管理**: 検索・フィルタリング機能
4. **リアルタイムプレビュー**: 編集中の即座確認

#### 今後の拡張予定
- **テンプレート共有**: インポート・エクスポート機能の強化
- **テンプレート変数**: 動的変数置換機能
- **高度な検索**: 日付・作成者での検索
- **テンプレート分析**: 使用頻度・人気度の分析

この実装により、**テンプレート管理機能**が完全に完了し、ユーザーは効率的にテンプレートを作成・編集・削除できるようになりました。Phase 5-1のテンプレート選択機能と組み合わせることで、完全なテンプレートシステムが実現されました。 