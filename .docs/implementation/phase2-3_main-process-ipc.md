# Phase 2-3: メインプロセスIPC実装

## 概要
メインプロセス(`electron/main.ts`)にファイル操作のIPCハンドラーを実装し、プリロードスクリプトで定義されたAPIの実際の処理を構築する。

## 実装内容

### 1. 必要なインポートの追加
```typescript
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import type { FileOperationResult } from '../src/types/electron'
```

### 2. IPCハンドラーの実装

#### `file:open` ハンドラー
- `dialog.showOpenDialog`でファイル選択ダイアログを表示
- Markdown、テキスト、全ファイルのフィルターを設定
- 選択されたファイルを`readFile`で読み込み
- UTF-8エンコーディングで文字列として返却

#### `file:save` ハンドラー
- 指定されたパスにファイルを保存
- `writeFile`でUTF-8エンコーディングで書き込み
- 保存成功時にファイルパスを返却

#### `file:saveAs` ハンドラー
- `dialog.showSaveDialog`で保存先選択ダイアログを表示
- デフォルトファイル名を`untitled.md`に設定
- 選択されたパスにファイルを保存

### 3. エラーハンドリング
- 全てのハンドラーでtry-catch文を使用
- ユーザーキャンセル時の適切な処理
- エラーメッセージの型安全な処理(`Error`型チェック)

### 4. 型安全性の保証
- `FileOperationResult`インターフェースを使用
- TypeScriptの厳密な型チェックに対応
- プリロードスクリプトとの型整合性を確保

## 技術的な特徴

### 非同期処理
- 全てのファイル操作を`async/await`で実装
- Node.jsの`fs/promises`を使用してPromiseベースのAPI活用

### セキュリティ
- ファイルダイアログによるユーザー制御のファイルアクセス
- 不正なファイルパスへの直接アクセスを防止

### ユーザビリティ
- 適切なファイルフィルターの設定
- 日本語のダイアログタイトル
- 明確なエラーメッセージ

## 品質チェック結果
- ✅ TypeScript コンパイル: エラーなし
- ✅ ESLint: エラーなし
- ✅ 型安全性: `FileOperationResult`型で保証
- ✅ エラーハンドリング: 全ケース対応済み

## 次のステップ
Phase 3-1: レンダラープロセスでのファイルメニュー実装
- AppBarにファイルメニューを追加
- `window.electronAPI`を使用したファイル操作の呼び出し
- ファイル内容の状態管理（useState） 