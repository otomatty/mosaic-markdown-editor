# Phase 3-3: Markdownプレビュー実装

## 概要
`marked`ライブラリを使用してMarkdown→HTML変換を実装し、分割画面レイアウトでリアルタイムプレビュー機能を構築する。

## 実装内容

### 1. 必要なインポートの追加
```typescript
import Paper from '@mui/material/Paper'
import { useState, useMemo } from 'react'
import { marked } from 'marked'
```

### 2. 分割画面レイアウトのスタイル
```typescript
const useStyles = makeStyles()((theme) => ({
  editorContainer: {
    flexGrow: 1,
    display: 'flex',
    gap: theme.spacing(2),
  },
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  previewPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 'bold',
  },
}))
```

### 3. Markdownプレビューのスタイリング
```typescript
preview: {
  flexGrow: 1,
  padding: theme.spacing(2),
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  '& p': {
    marginBottom: theme.spacing(1),
    lineHeight: 1.6,
  },
  '& pre': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    overflow: 'auto',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  },
  '& code': {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    marginLeft: 0,
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
  },
},
```

### 4. リアルタイムMarkdown変換
```typescript
const previewHtml = useMemo(() => {
  if (!fileContent) return ''
  
  try {
    // markedの設定
    marked.setOptions({
      breaks: true,
      gfm: true,
    })
    
    return marked(fileContent)
  } catch (error) {
    console.error('Markdown parsing error:', error)
    return '<p>Markdownの解析でエラーが発生しました</p>'
  }
}, [fileContent])
```

### 5. 分割画面UI構造
```typescript
<div className={classes.editorContainer}>
  {/* エディタパネル */}
  <Paper className={classes.editorPanel} elevation={1}>
    <Typography className={classes.panelHeader} variant="subtitle2">
      エディタ
    </Typography>
    <TextField
      className={classes.editor}
      multiline
      value={fileContent}
      onChange={handleContentChange}
      placeholder="Markdownを入力してください..."
      // ... その他のプロパティ
    />
  </Paper>
  
  {/* プレビューパネル */}
  <Paper className={classes.previewPanel} elevation={1}>
    <Typography className={classes.panelHeader} variant="subtitle2">
      プレビュー
    </Typography>
    <div 
      className={classes.preview}
      dangerouslySetInnerHTML={{ __html: previewHtml }}
    />
  </Paper>
</div>
```

## 技術的な特徴

### パフォーマンス最適化
- **`useMemo`**: `fileContent`が変更された時のみHTML再生成
- **条件付きレンダリング**: ファイル未選択時はプレビューを非表示
- **エラーハンドリング**: Markdown解析エラーの適切な処理

### Markdownサポート
- **GitHub Flavored Markdown**: `gfm: true`でGFM記法をサポート
- **改行処理**: `breaks: true`で改行を`<br>`に変換
- **豊富な要素**: 見出し、段落、リスト、コードブロック、引用をサポート

### ユーザビリティ
- **分割画面**: エディタとプレビューを同時表示
- **リアルタイム更新**: 入力と同時にプレビューが更新
- **プロフェッショナルなスタイリング**: 読みやすい typography とレイアウト

### セキュリティ
- **`dangerouslySetInnerHTML`**: 慎重に使用し、信頼できるコンテンツのみ表示
- **エラーハンドリング**: 不正なMarkdownに対する適切な処理

## 品質チェック結果
- ✅ TypeScript コンパイル: エラーなし
- ✅ ESLint: エラーなし
- ✅ 未使用インポート: 削除済み
- ✅ パフォーマンス: useMemoで最適化済み

## 次のステップ
Phase 3-4: React Mosaic統合（オプション）
- パネルのリサイズ機能
- ドラッグ&ドロップによるパネル再配置
- より高度なレイアウト管理

または

Phase 4: アプリケーションの完成度向上
- 国際化(i18n)対応
- 設定の永続化
- アプリケーションの最終調整 