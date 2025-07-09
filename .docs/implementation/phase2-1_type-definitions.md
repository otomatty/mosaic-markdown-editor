# フェーズ2-1: ElectronAPI の型定義作成

このドキュメントは、フェーズ2「Electronの核心 - ファイルI/Oの実装」の最初のステップとして、TypeScript型定義ファイルの作成作業をまとめたものです。

## 実施内容

### 1. 型定義ファイルの作成

ElectronのファイルI/O APIを型安全に呼び出すための型定義ファイルを作成しました。

**作成ファイル:** `src/types/electron.d.ts`

### 2. 型定義の設計

#### FileOperationResult インターフェース

ファイル操作の結果を表現する統一的なインターフェースを定義しました。

```typescript
export interface FileOperationResult {
  success: boolean      // 操作の成功/失敗
  filePath?: string     // 操作されたファイルのパス（オプション）
  content?: string      // ファイルの内容（読み込み時のみ）
  error?: string        // エラーメッセージ（失敗時のみ）
}
```

**設計の特徴:**
- `success`フラグで操作結果を明確に判別
- オプショナルプロパティで柔軟な利用を可能に
- エラーハンドリングを型レベルで強制

#### ElectronAPI インターフェース

レンダラープロセスから呼び出すElectron APIの型定義を作成しました。

```typescript
export interface ElectronAPI {
  // ファイル操作API
  openFile: () => Promise<FileOperationResult>
  saveFile: (filePath: string, content: string) => Promise<FileOperationResult>
  saveFileAs: (content: string) => Promise<FileOperationResult>
  
  // 既存のIPC API
  ipcRenderer: {
    on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    off: (channel: string, listener?: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => void
    send: (channel: string, ...args: unknown[]) => void
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}
```

**API設計の方針:**
- **`openFile`**: ファイル選択ダイアログを表示し、選択されたファイルを読み込む
- **`saveFile`**: 既存のファイルパスに内容を保存する
- **`saveFileAs`**: 保存ダイアログを表示し、新しいファイルパスに保存する
- **`ipcRenderer`**: 既存のIPC通信APIも型安全に利用可能

### 3. 型安全性の向上

#### any型の排除

初期実装で使用していた`any`型を完全に排除し、より型安全な実装に修正しました。

**修正内容:**
- `any` → `unknown`（より型安全な不明な型）
- `event: any` → `event: Electron.IpcRendererEvent`（Electronの適切な型）
- IPCメソッドのパラメータ型を正確に定義

#### グローバル型拡張

`window.electronAPI`でアクセスできるよう、グローバルな型を拡張しました。

```typescript
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

### 4. TypeScript設定の確認

`tsconfig.json`の設定を確認し、`src/types/electron.d.ts`が自動的に認識されることを確認しました。

**確認項目:**
- `include: ["src", "electron"]`により、`src`ディレクトリ内の型定義ファイルが自動認識される
- 追加の設定変更は不要

## 型定義の利用方法

### レンダラープロセスでの利用例

```typescript
// ファイルを開く
const result = await window.electronAPI.openFile()
if (result.success) {
  console.log('ファイルパス:', result.filePath)
  console.log('ファイル内容:', result.content)
} else {
  console.error('エラー:', result.error)
}

// ファイルを保存
const saveResult = await window.electronAPI.saveFile('/path/to/file.md', 'content')
if (saveResult.success) {
  console.log('保存完了')
}
```

### 型チェックの恩恵

- **コンパイル時エラー検出**: 存在しないプロパティへのアクセスを防止
- **IntelliSense**: IDEでの自動補完とドキュメント表示
- **リファクタリング安全性**: 型に基づいた安全なコード変更

## 次のステップ

型定義が完成したので、次は以下の順序で実装を進めます：

1. **プリロードスクリプトの拡張** (`electron/preload.ts`)
   - `contextBridge`でファイル操作APIを公開
   - 型定義に基づいたAPI実装

2. **メインプロセスのIPC ハンドラー実装** (`electron/main.ts`)
   - `ipcMain.handle`でファイル操作を処理
   - Node.jsの`fs/promises`とElectronの`dialog`を使用

3. **レンダラー側でのファイルメニュー実装** (`src/App.tsx`)
   - AppBarにファイルメニューを追加
   - 型安全なAPI呼び出し

## 技術的な注意点

- **型定義ファイル**: `.d.ts`ファイルは型情報のみを提供し、実行時コードは含まない
- **グローバル型拡張**: `declare global`は慎重に使用し、名前空間の汚染を避ける
- **unknown型**: `any`型の代替として、より型安全な`unknown`型を使用
- **Electron型**: `Electron.IpcRendererEvent`など、Electronが提供する型を積極的に活用

この型定義により、ElectronのIPC通信を型安全に実装する基盤が整いました。 