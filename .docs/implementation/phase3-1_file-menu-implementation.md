# Phase 3-1: ファイルメニュー実装

## 概要
AppBarにファイルメニューを追加し、実際にファイル操作（開く、保存、名前を付けて保存）を呼び出せるUIを実装する。

## 実装内容

### 1. 必要なインポートの追加
```typescript
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import SaveIcon from '@mui/icons-material/Save'
import SaveAsIcon from '@mui/icons-material/SaveAs'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useState } from 'react'
```

### 2. 状態管理の追加
```typescript
// ファイル操作の状態管理
const [fileContent, setFileContent] = useState<string>('')
const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
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
```

### 3. ファイルメニューUI
- **メニューボタン**: IconButtonからButtonに変更し、「ファイル」テキストを表示
- **ドロップダウンメニュー**: MUIのMenuコンポーネントを使用
- **メニューアイテム**: 適切なアイコンと共に3つのオプションを表示
  - 開く (FolderOpenIcon)
  - 保存 (SaveIcon)
  - 名前を付けて保存 (SaveAsIcon)

### 4. ファイル操作の実装

#### `handleOpenFile`
- `window.electronAPI.openFile()`を呼び出し
- 成功時: ファイル内容とパスを状態に保存
- エラー時: 適切なエラーメッセージを表示

#### `handleSaveFile`
- 現在のファイルパスが存在する場合: `window.electronAPI.saveFile()`を呼び出し
- ファイルパスが存在しない場合: `handleSaveAsFile()`に自動転送

#### `handleSaveAsFile`
- `window.electronAPI.saveFileAs()`を呼び出し
- 成功時: 新しいファイルパスを状態に保存

### 5. ユーザーフィードバック機能

#### 通知システム
- **Snackbar + Alert**: 成功/エラーメッセージを表示
- **自動非表示**: 4秒後に自動的に消える
- **位置設定**: 画面下部中央に表示

#### ファイルパス表示
- タイトルバーに現在開いているファイルのパスを表示
- `currentFilePath`が存在する場合のみ表示

### 6. エラーハンドリング
- 全てのファイル操作でtry-catch文を使用
- `FileOperationResult`の`success`フィールドをチェック
- 適切なエラーメッセージをユーザーに表示

## 技術的な特徴

### 型安全性
- `window.electronAPI`の型定義を活用
- `FileOperationResult`インターフェースで戻り値の型を保証
- TypeScriptの厳密な型チェックに対応

### ユーザビリティ
- 直感的なファイルメニューUI
- 適切なアイコンとテキストラベル
- 成功/エラー時の明確なフィードバック

### 状態管理
- Reactの`useState`を使用した適切な状態管理
- ファイル内容、パス、メニュー状態を分離

## 品質チェック結果
- ✅ TypeScript コンパイル: エラーなし
- ✅ ESLint: エラーなし
- ✅ 未使用インポート: 削除済み
- ✅ 型安全性: 全て型付け済み

## 次のステップ
Phase 3-2: テキストエディタ実装
- ファイル内容を表示・編集するためのテキストエリア追加
- リアルタイムでファイル内容を更新
- 編集状態の管理（未保存変更の検知） 