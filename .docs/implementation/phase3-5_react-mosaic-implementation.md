# フェーズ3-5: React Mosaic基本実装

## 実施内容

### 作業概要
固定分割レイアウトからReact Mosaicによる動的分割レイアウトへの移行を実施。エディタとプレビューパネルのリサイズ・分割・結合機能を実装。

### 実装した機能
1. **React Mosaicライブラリの基本導入**
   - 必要なインポートと型定義の追加
   - `react-mosaic-component`と`react-mosaic-component.css`の統合

2. **MosaicLayoutの初期状態定義**
   - 左側エディタ、右側プレビューの2分割レイアウト
   - 50%ずつの分割比率で初期化
   - 型安全な`MosaicNode<MosaicWindowId>`の状態管理

3. **MosaicWindowコンポーネントの実装**
   - エディタパネルとプレビューパネルの各MosaicWindow内でのレンダリング
   - 適切なタイトル設定（「エディタ」「プレビュー」）
   - 型安全な`renderMosaicWindow`関数

4. **固定分割レイアウトからの置き換え**
   - 既存の`editorContainer`を`Mosaic`コンポーネントに置き換え
   - 動的レイアウト変更機能の追加

### 修正したファイル
- `src/App.tsx`: メインの実装ファイル
- スタイル定義: `editorContainer` → `mosaicContainer`に変更

## 技術的な判断

### React Mosaicライブラリの選択理由
1. **業界標準**: 多くのプロジェクトで使用されている実績
2. **TypeScript対応**: 型安全な実装が可能
3. **豊富な機能**: ドラッグ&ドロップ、リサイズ、分割・結合に対応
4. **軽量**: 依存関係が少なく、パフォーマンスが良い

### 型定義の処理
- **MosaicBranch型の問題**: `renderTile`関数の`path`引数は`string[]`として定義されているが、`MosaicWindow`は`MosaicBranch[]`を期待
- **型キャストによる解決**: `path as MosaicBranch[]`を使用して型の互換性を確保
- **安全性の考慮**: 実際の値は`'first' | 'second'`のみなので、型キャストは安全

### レイアウト初期化の設計
```typescript
const [mosaicLayout, setMosaicLayout] = useState<MosaicNode<MosaicWindowId> | null>({
  direction: 'row',        // 横方向分割
  first: 'editor',         // 左側にエディタ
  second: 'preview',       // 右側にプレビュー
  splitPercentage: 50,     // 50%ずつの分割
})
```

## 実装詳細

### 新しいインポート
```typescript
import { Mosaic, MosaicWindow, MosaicNode, MosaicBranch } from 'react-mosaic-component'
import 'react-mosaic-component/react-mosaic-component.css'
```

### ウィンドウID型の定義
```typescript
type MosaicWindowId = 'editor' | 'preview'
```

### MosaicWindowレンダリング関数
```typescript
const renderMosaicWindow = (id: MosaicWindowId, path: string[]) => {
  // pathをMosaicBranch[]に型キャスト
  const mosaicPath = path as MosaicBranch[]
  
  switch (id) {
    case 'editor':
      return (
        <MosaicWindow path={mosaicPath} title="エディタ">
          <EditorPanel value={fileContent} onChange={handleContentChange} />
        </MosaicWindow>
      )
    case 'preview':
      return (
        <MosaicWindow path={mosaicPath} title="プレビュー">
          <PreviewPanel content={fileContent} />
        </MosaicWindow>
      )
    default:
      return <div>Unknown window type</div>
  }
}
```

### スタイル変更
```typescript
// 変更前
editorContainer: {
  flexGrow: 1,
  display: 'flex',
  gap: theme.spacing(2),
}

// 変更後
mosaicContainer: {
  flexGrow: 1,
  position: 'relative',
}
```

### JSXの変更
```typescript
// 変更前
<div className={classes.editorContainer}>
  <EditorPanel ... />
  <PreviewPanel ... />
</div>

// 変更後
<div className={classes.mosaicContainer}>
  <Mosaic<MosaicWindowId>
    value={mosaicLayout}
    onChange={handleMosaicChange}
    renderTile={renderMosaicWindow}
  />
</div>
```

## 品質チェック結果

### TypeScript型チェック
```bash
$ yarn tsc --noEmit
✨  Done in 3.33s.
```
**結果**: ✅ エラーなし（型キャストにより解決）

### ESLintチェック
```bash
$ yarn lint
✨  Done in 1.35s.
```
**結果**: ✅ エラーなし（TypeScriptバージョン警告は既知の問題）

### 動作確認
```bash
$ yarn dev
```
**結果**: ✅ 正常に起動・動作確認完了

### 新機能
- ✅ パネルのリサイズ機能
- ✅ パネルの分割・結合機能
- ✅ 型安全な実装
- ✅ 既存機能の互換性維持

## 次のステップ

### 完了した作業
- [x] React Mosaicライブラリの基本導入
- [x] MosaicLayoutの初期状態定義
- [x] MosaicWindowコンポーネントの実装
- [x] 固定分割レイアウトからの置き換え
- [x] 品質チェック完了

### 次の作業準備
- [x] ドラッグ&ドロップ機能の実装準備
- [x] レイアウト永続化機能の実装準備
- [x] 高度なMosaic機能の追加準備

### 将来の拡張可能性
1. **レイアウト永続化**: `localStorage`や`electron-store`での状態保存
2. **ツールバー機能**: 分割・結合・削除ボタンの追加
3. **テーマ統合**: MUIテーマとMosaicテーマの統合
4. **パフォーマンス最適化**: 大きなファイルでのスムーズな動作

## 注意点

### 開発者向け注意事項

1. **型定義の互換性**: `MosaicBranch`と`string[]`の型キャストが必要
2. **CSSの読み込み**: `react-mosaic-component.css`の読み込みが必須
3. **レイアウト状態管理**: `mosaicLayout`の状態管理が重要
4. **デフォルトケース**: `renderTile`関数で`null`を返さないこと

### 既知の制限事項

1. **型定義の不整合**: `renderTile`関数の`path`引数の型定義が不正確
2. **Blueprint依存**: デフォルトのテーマはBlueprint UIに依存
3. **パフォーマンス**: 非常に大きなファイルでのパフォーマンス未検証
4. **アクセシビリティ**: キーボードナビゲーションの最適化が必要

### トラブルシューティング

1. **型エラー**: `path as MosaicBranch[]`の型キャストを確認
2. **スタイル適用されない**: CSSファイルの読み込みを確認
3. **レイアウト崩れ**: `mosaicContainer`のスタイル設定を確認
4. **機能動作しない**: `renderTile`関数の戻り値がReactElementか確認

### パフォーマンス考慮事項

1. **メモ化**: 大きなファイルの場合、`React.memo`の使用を検討
2. **状態更新**: `handleMosaicChange`の最適化
3. **レンダリング**: `renderMosaicWindow`関数の最適化
4. **メモリ使用量**: 長時間使用時のメモリリーク対策

このReact Mosaic基本実装により、固定分割レイアウトから動的分割レイアウトへの移行が完了し、ユーザーがパネルを自由にリサイズ・分割・結合できる高度なUI機能が実現されました。 