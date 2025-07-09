# 開発ワークフロー: Mosaic Markdown Editor

このドキュメントは、Mosaic Markdown Editorプロジェクトの開発における標準的なワークフローと作業手順を定義したものです。

## 基本的な開発フロー

### 3ステップワークフロー

すべての開発作業は以下の3ステップで進行します：

```
1. 実装 → 2. 品質チェック → 3. ドキュメント化
```

#### ステップ1: 実装
- 実装計画書（`prd.md`）に従って機能を実装
- 型定義を先に作成し、型安全性を確保
- 段階的な実装を心がけ、一度に大きな変更を行わない

#### ステップ2: 品質チェック
- **Lintエラー**: ESLintやTypeScriptコンパイラエラーの解消
- **型チェック**: `any`型の排除、適切な型定義の使用
- **動作確認**: `yarn dev`での実際の動作テスト

#### ステップ3: ドキュメント化
- 作業ログをMarkdownファイルに記録
- 実装内容、技術的な判断、注意点を詳細に記述
- 次のステップへの準備状況を明記

## ファイル命名規則

### 作業ログファイル

```
.docs/implementation/phase{フェーズ番号}-{サブフェーズ番号}_{作業内容}.md
```

**例:**
- `phase1-1_libraries-install.md` - フェーズ1-1: ライブラリインストール
- `phase1-2_mui-setup.md` - フェーズ1-2: MUIセットアップ
- `phase2-1_type-definitions.md` - フェーズ2-1: 型定義作成
- `phase2-2_preload-implementation.md` - フェーズ2-2: プリロード実装

### 作業内容の命名ガイドライン

- **英語**: 技術的な内容は英語で記述
- **ケバブケース**: 単語間はハイフン（`-`）で連結
- **簡潔性**: 内容が一目で分かる名前を選択
- **一貫性**: 同じ種類の作業は同じ命名パターンを使用

## フェーズ別の作業構成

### フェーズ1: 基盤構築とUIセットアップ

```
phase1-1_libraries-install.md     - ライブラリインストール
phase1-2_mui-setup.md            - MUIとTSS-Reactセットアップ
```

**完了条件:**
- [x] 必要なライブラリのインストール
- [x] MUIの基本コンポーネント配置
- [x] TSS-Reactによるスタイリング
- [x] 開発サーバーでの動作確認

### フェーズ2: Electronの核心 - ファイルI/Oの実装

```
phase2-1_type-definitions.md      - TypeScript型定義作成
phase2-2_preload-implementation.md - プリロードスクリプト実装
phase2-3_main-process-handlers.md - メインプロセスIPC実装
phase2-4_renderer-file-menu.md    - レンダラー側ファイルメニュー
```

**完了条件:**
- [x] 型安全なAPI定義
- [ ] contextBridgeによるAPI公開
- [ ] IPCハンドラーによるファイル操作
- [ ] UIでのファイルメニュー実装

### フェーズ3: 高度なUI - パネルレイアウトとリアルタイムプレビュー

```
phase3-1_mosaic-layout.md         - React Mosaicレイアウト実装
phase3-2_markdown-preview.md      - Markdownプレビュー機能
phase3-3_drag-drop.md            - ドラッグ&ドロップ機能
phase3-4_integration-testing.md   - 統合テストと動作確認
```

### フェーズ4: アプリケーションの完成度向上

```
phase4-1_i18n-setup.md           - 国際化(i18n)実装
phase4-2_settings-persistence.md  - 設定永続化機能
phase4-3_ui-polish.md            - UI/UXの最終調整
```

### フェーズ5: ビルドと配布

```
phase5-1_build-configuration.md   - ビルド設定とアイコン
phase5-2_distribution-packages.md - 配布パッケージ作成
phase5-3_deployment-testing.md    - 配布テストと最終確認
```

## 作業ログの標準構成

### 必須セクション

```markdown
# フェーズ{番号}-{サブ番号}: {作業タイトル}

## 実施内容
- 具体的な実装内容
- 追加/変更したファイル
- 使用した技術やライブラリ

## 技術的な判断
- 設計上の決定事項
- 代替案との比較
- 選択した理由

## 実装詳細
- コード例
- 重要な設定変更
- 依存関係の追加

## 品質チェック結果
- Lintエラーの解消状況
- 型チェックの結果
- 動作確認の結果

## 次のステップ
- 次に実装すべき機能
- 残っている課題
- 準備が整った状態の確認

## 注意点
- 将来の開発者への注意事項
- 既知の制限事項
- トラブルシューティング情報
```

## 品質チェックリスト

### TypeScript関連
- [ ] `any`型の使用を避けている
- [ ] 適切な型定義を使用している
- [ ] 型エラーが発生していない
- [ ] 未使用のimportが残っていない

### コード品質
- [ ] ESLintエラーが発生していない
- [ ] 一貫したコーディングスタイル
- [ ] 適切なコメントが記述されている
- [ ] デッドコードが残っていない

### 機能動作
- [ ] `yarn dev`で正常に起動する
- [ ] 実装した機能が期待通りに動作する
- [ ] エラーハンドリングが適切に行われている
- [ ] ユーザビリティに問題がない

## Git管理との連携

### コミットメッセージ形式

```
feat(phase{番号}-{サブ番号}): {変更内容の概要}

- 具体的な変更点1
- 具体的な変更点2
- 関連するファイル: filename.ts
```

### ブランチ戦略

```
main                    - 安定版
├── phase1-foundation   - フェーズ1作業ブランチ
├── phase2-electron     - フェーズ2作業ブランチ
└── phase3-ui-advanced  - フェーズ3作業ブランチ
```

## コンポーネント実装ガイドライン

### コンポーネント設計の基本原則

1. **単一責任の原則**: 各コンポーネントは一つの明確な責任を持つ
2. **再利用性**: 他の部分でも使用できるよう汎用的に設計する
3. **型安全性**: 全てのpropsとstateに適切な型定義を行う
4. **テスタビリティ**: 単体テストが容易になるよう設計する

### ファイル構成とディレクトリ構造

#### 単一ファイルコンポーネント
シンプルで独立性の高いコンポーネントの場合：

```
src/components/
├── ComponentName.tsx
├── AnotherComponent.tsx
└── ...
```

**適用例:**
- `NotificationSnackbar.tsx` - 通知表示のみの責任
- `WelcomeScreen.tsx` - ウェルカムメッセージの表示のみ
- `EditorPanel.tsx` - テキストエディタ部分のみ
- `PreviewPanel.tsx` - プレビュー表示のみ

#### ディレクトリ構成コンポーネント
複雑で複数のサブコンポーネントを持つ場合：

```
src/components/
├── ComplexComponent/
│   ├── index.tsx          # エクスポート用
│   ├── ComplexComponent.tsx # メインコンポーネント
│   ├── SubComponent1.tsx   # サブコンポーネント
│   └── SubComponent2.tsx   # サブコンポーネント
```

**適用例:**
- `AppHeader/` - ヘッダー、ツールバー、メニューを含む
- `FileMenu/` - ファイル操作メニューとロジック

### TypeScript型定義の実装

#### Props型定義のベストプラクティス

```typescript
// 必須プロパティと任意プロパティを明確に分離
interface ComponentProps {
  // 必須プロパティ
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  
  // 任意プロパティ
  placeholder?: string
  disabled?: boolean
  
  // コールバック関数は具体的な型を指定
  onSubmit?: (data: FormData) => void
  onError?: (error: Error) => void
}

// React.FCを使用して型安全性を確保
const Component: React.FC<ComponentProps> = ({
  value,
  onChange,
  placeholder = 'デフォルト値',
  disabled = false,
  onSubmit,
  onError,
}) => {
  // 実装
}
```

#### 状態管理の型定義

```typescript
// 状態の型を明確に定義
interface ComponentState {
  isLoading: boolean
  data: DataType | null
  error: string | null
}

// useStateで型を指定
const [state, setState] = useState<ComponentState>({
  isLoading: false,
  data: null,
  error: null,
})
```

### スタイリング実装

#### TSS-Reactを使用したスタイル定義

```typescript
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
  root: {
    // コンポーネントのルート要素
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    // ヘッダー部分
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
  },
  content: {
    // コンテンツ部分
    flexGrow: 1,
    padding: theme.spacing(1),
  },
}))

// コンポーネント内での使用
const Component: React.FC<Props> = () => {
  const { classes } = useStyles()
  
  return (
    <div className={classes.root}>
      <header className={classes.header}>...</header>
      <main className={classes.content}>...</main>
    </div>
  )
}
```

### コンポーネント分割の判断基準

#### 分割すべきケース

1. **コンポーネントが100行を超える場合**
2. **複数の責任を持っている場合**
3. **再利用の可能性がある場合**
4. **独立してテストできる機能の場合**

#### 分割しない方が良いケース

1. **密結合で分離が困難な場合**
2. **一度しか使用されない小さな要素**
3. **親コンポーネントの状態に強く依存する場合**

### 実装手順

#### 1. コンポーネント分析
```bash
# 現在のコンポーネントの構造を分析
- 責任の分離点を特定
- 再利用可能な部分を識別
- 依存関係を整理
```

#### 2. 型定義の作成
```typescript
// まず型定義を作成
interface NewComponentProps {
  // 必要なプロパティを定義
}
```

#### 3. コンポーネント実装
```typescript
// 型安全なコンポーネントを実装
const NewComponent: React.FC<NewComponentProps> = (props) => {
  // 実装
}
```

#### 4. 親コンポーネントの更新
```typescript
// 新しいコンポーネントを使用するよう更新
import NewComponent from './components/NewComponent'

// 使用箇所を置き換え
<NewComponent {...props} />
```

## 開発環境の管理

### 必須コマンド

```bash
# 開発サーバー起動
yarn dev

# 型チェック
yarn tsc --noEmit

# Lintチェック
yarn lint

# ビルド確認
yarn build
```

### 推奨開発ツール

- **IDE**: Visual Studio Code
- **拡張機能**: 
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Material-UI Snippets

## トラブルシューティング

### よくある問題と解決法

1. **型エラー**: `src/types/electron.d.ts`の型定義を確認
2. **Lintエラー**: ESLintの設定とコーディング規約を確認
3. **ビルドエラー**: 依存関係の不整合を`yarn install`で解決
4. **Electronエラー**: メインプロセスとレンダラープロセスの通信を確認

このワークフローに従うことで、一貫性のある高品質な開発を実現できます。 