# フェーズ3-4: コンポーネントリファクタリング

## 実施内容

### 作業概要
App.tsxが217行に肥大化したため、保守性と再利用性を向上させるためのコンポーネント分割リファクタリングを実施。

### 分割したコンポーネント

#### 1. テーマ設定の分離
- **ファイル**: `src/theme.ts`
- **責任**: MUIテーマ設定の管理
- **理由**: 設定の一元管理と再利用性の向上

#### 2. 通知システム
- **ファイル**: `src/components/NotificationSnackbar.tsx`
- **責任**: 通知メッセージの表示
- **Props**: `open`, `message`, `severity`, `onClose`
- **理由**: 単一責任で独立性が高い

#### 3. ウェルカムスクリーン
- **ファイル**: `src/components/WelcomeScreen.tsx`
- **責任**: 初期画面のウェルカムメッセージ表示
- **Props**: なし（完全に独立）
- **理由**: 再利用可能で単純な表示コンポーネント

#### 4. エディタパネル
- **ファイル**: `src/components/EditorPanel.tsx`
- **責任**: テキストエディタ機能
- **Props**: `value`, `onChange`, `placeholder?`
- **理由**: 独立したエディタ機能として再利用可能

#### 5. プレビューパネル
- **ファイル**: `src/components/PreviewPanel.tsx`
- **責任**: Markdownプレビュー表示
- **Props**: `content`
- **理由**: Markdown変換ロジックを含む独立機能

#### 6. ファイルメニュー（ディレクトリ構成）
- **ディレクトリ**: `src/components/FileMenu/`
- **メインファイル**: `FileMenu.tsx`
- **インデックス**: `index.tsx`
- **責任**: ファイル操作メニューの表示
- **Props**: `anchorEl`, `open`, `onClose`, `onOpenFile`, `onSaveFile`, `onSaveAsFile`
- **理由**: 将来的にサブメニューや複雑な機能追加の可能性

#### 7. アプリヘッダー（ディレクトリ構成）
- **ディレクトリ**: `src/components/AppHeader/`
- **メインファイル**: `AppHeader.tsx`
- **インデックス**: `index.tsx`
- **責任**: アプリケーションヘッダーとツールバー
- **Props**: `currentFilePath`, `hasUnsavedChanges`, `fileMenuAnchor`, `onFileMenuOpen`, `onFileMenuClose`, `onOpenFile`, `onSaveFile`, `onSaveAsFile`
- **理由**: 複雑な状態管理と複数のサブコンポーネント連携

### リファクタリング後のApp.tsx
- **行数**: 217行 → 142行（約35%削減）
- **責任**: 状態管理とコンポーネント間の連携のみ
- **改善点**: 
  - 各コンポーネントの責任が明確化
  - 型安全性の向上
  - テストの容易性向上
  - コードの可読性向上

## 技術的な判断

### コンポーネント分割の基準

1. **単一責任の原則**: 各コンポーネントが一つの明確な責任を持つ
2. **再利用性**: 他の部分でも使用できる汎用性
3. **独立性**: 親コンポーネントへの依存度が低い
4. **サイズ**: 100行を超える場合は分割を検討

### ディレクトリ構成 vs 単一ファイルの判断

#### 単一ファイル採用コンポーネント
- **NotificationSnackbar**: シンプルな表示のみ
- **WelcomeScreen**: 静的な表示のみ
- **EditorPanel**: 独立したエディタ機能
- **PreviewPanel**: 独立したプレビュー機能

#### ディレクトリ構成採用コンポーネント
- **FileMenu**: 将来的なサブメニュー追加の可能性
- **AppHeader**: 複数のサブコンポーネント連携

### 型定義の設計

```typescript
// 例: EditorPanelの型定義
interface EditorPanelProps {
  value: string                                          // 必須
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  // 必須
  placeholder?: string                                   // 任意（デフォルト値あり）
}
```

**設計方針:**
- 必須プロパティと任意プロパティの明確な分離
- イベントハンドラーの具体的な型指定
- デフォルト値の適切な設定

## 実装詳細

### 新しいディレクトリ構造

```
src/
├── components/
│   ├── AppHeader/
│   │   ├── index.tsx
│   │   └── AppHeader.tsx
│   ├── FileMenu/
│   │   ├── index.tsx
│   │   └── FileMenu.tsx
│   ├── EditorPanel.tsx
│   ├── PreviewPanel.tsx
│   ├── WelcomeScreen.tsx
│   └── NotificationSnackbar.tsx
├── theme.ts
└── App.tsx
```

### インポート構造の最適化

```typescript
// App.tsx での新しいインポート
import theme from './theme'
import AppHeader from './components/AppHeader'
import EditorPanel from './components/EditorPanel'
import PreviewPanel from './components/PreviewPanel'
import WelcomeScreen from './components/WelcomeScreen'
import NotificationSnackbar from './components/NotificationSnackbar'
```

### TSS-Reactスタイルの分散

各コンポーネントで必要なスタイルのみを定義し、App.tsxから不要なスタイルを除去：

```typescript
// 例: PreviewPanel.tsx
const useStyles = makeStyles()((theme) => ({
  previewPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  // プレビュー関連のスタイルのみ
}))
```

## 品質チェック結果

### TypeScript型チェック
```bash
$ yarn tsc --noEmit
✨  Done in 1.92s.
```
**結果**: ✅ エラーなし

### ESLintチェック
```bash
$ yarn lint
✨  Done in 1.04s.
```
**結果**: ✅ エラーなし（TypeScriptバージョン警告のみ）

### 動作確認
```bash
$ yarn dev
```
**結果**: ✅ 正常に起動・動作確認完了

### コードメトリクス
- **App.tsx行数**: 217行 → 142行（35%削減）
- **コンポーネント数**: 1個 → 7個（責任分散）
- **型定義**: 全てのコンポーネントで適切な型定義
- **再利用性**: 各コンポーネントが独立して使用可能

## 次のステップ

### 完了した作業
- [x] App.tsxのコンポーネント分割
- [x] 型安全なProps設計
- [x] TSS-Reactスタイルの分散
- [x] ディレクトリ構造の最適化
- [x] 品質チェックの完了

### 次の作業準備
- [x] React Mosaicライブラリの導入準備
- [x] ドラッグ&ドロップ機能の実装準備
- [x] コンポーネント実装ガイドラインの文書化

### 将来の拡張性
1. **テスト追加**: 各コンポーネントの単体テスト
2. **Storybook導入**: コンポーネントカタログの作成
3. **パフォーマンス最適化**: React.memoの適用検討
4. **アクセシビリティ**: ARIA属性の追加

## 注意点

### 開発者向け注意事項

1. **コンポーネント追加時**: development-workflow.mdのガイドラインに従う
2. **型定義**: `any`型は使用せず、適切な型定義を行う
3. **スタイル**: TSS-Reactを使用し、インラインスタイルは避ける
4. **Props設計**: 必須・任意の明確な分離を行う

### 既知の制限事項

1. **TypeScriptバージョン**: 5.8.3は非公式サポート（動作に問題なし）
2. **コンポーネント間通信**: 現在は親コンポーネント経由のみ
3. **状態管理**: 複雑化した場合はContext APIの導入を検討

### トラブルシューティング

1. **型エラー**: 各コンポーネントのProps型定義を確認
2. **スタイル適用されない**: TSS-ReactのuseStylesフック使用を確認
3. **コンポーネント読み込みエラー**: index.tsxのエクスポートを確認

このリファクタリングにより、コードの保守性、再利用性、テスタビリティが大幅に向上し、今後の機能追加がより効率的に行えるようになりました。 