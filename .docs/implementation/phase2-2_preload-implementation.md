# フェーズ2-2: プリロードスクリプト実装

このドキュメントは、フェーズ2「Electronの核心 - ファイルI/Oの実装」の2番目のステップとして、プリロードスクリプトでのAPI実装作業をまとめたものです。

## 実施内容

### 1. プリロードスクリプトの完全書き換え

`electron/preload.ts`を拡張し、型定義に基づいたファイル操作APIを実装しました。

**変更ファイル:** `electron/preload.ts`

### 2. contextBridgeによるAPI公開

#### ファイル操作API の実装

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // ファイル操作API
  openFile: (): Promise<FileOperationResult> => 
    ipcRenderer.invoke('file:open'),
  
  saveFile: (filePath: string, content: string): Promise<FileOperationResult> => 
    ipcRenderer.invoke('file:save', filePath, content),
  
  saveFileAs: (content: string): Promise<FileOperationResult> => 
    ipcRenderer.invoke('file:saveAs', content),
})
```

**実装方針:**
- **`ipcRenderer.invoke`**: 非同期通信でメインプロセスと通信
- **チャンネル命名**: `file:` プレフィックスで明確な分類
- **型安全性**: `FileOperationResult`型による戻り値の保証

#### 既存IPC APIの型安全化

既存の`ipcRenderer`APIも型安全に再実装しました。

```typescript
ipcRenderer: {
  on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) {
    return ipcRenderer.on(channel, listener)
  },
  off(channel: string, listener?: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) {
    if (listener) {
      return ipcRenderer.off(channel, listener)
    } else {
      return ipcRenderer.removeAllListeners(channel)
    }
  },
  send(channel: string, ...args: unknown[]) {
    return ipcRenderer.send(channel, ...args)
  },
  invoke(channel: string, ...args: unknown[]) {
    return ipcRenderer.invoke(channel, ...args)
  }
}
```

## 技術的な判断

### 1. API設計の方針

#### チャンネル命名規則
- `file:open` - ファイル選択ダイアログ表示＆読み込み
- `file:save` - 既存ファイルパスへの保存
- `file:saveAs` - 新規ファイルパスへの保存

**選択理由:**
- プレフィックスによる機能分類で管理しやすい
- 将来的な機能拡張（`edit:`, `view:`など）に対応可能

#### 型定義の重複管理
プリロードスクリプト内にも`FileOperationResult`インターフェースを定義しました。

**代替案との比較:**
- **共通型定義ファイル**: より理想的だが、Electronの制約で困難
- **型の重複定義**: 現実的な解決策として採用

### 2. エラーハンドリング戦略

#### オプショナルリスナーの処理
`off`メソッドでリスナーが未指定の場合、全リスナーを削除する実装にしました。

```typescript
if (listener) {
  return ipcRenderer.off(channel, listener)
} else {
  return ipcRenderer.removeAllListeners(channel)
}
```

**選択理由:**
- TypeScriptの型安全性を保持
- 実用的なAPI設計（全削除機能の提供）

## 実装詳細

### 1. contextBridge の活用

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  // APIの実装
})
```

**重要な特徴:**
- **セキュリティ**: サンドボックス化されたレンダラープロセスとの安全な通信
- **型安全性**: TypeScriptの型チェックが有効
- **グローバルアクセス**: `window.electronAPI`でアクセス可能

### 2. IPC通信の実装

```typescript
ipcRenderer.invoke('file:open')
```

**通信フロー:**
1. レンダラープロセス → プリロードスクリプト
2. プリロードスクリプト → メインプロセス（`ipcRenderer.invoke`）
3. メインプロセス → プリロードスクリプト（結果返却）
4. プリロードスクリプト → レンダラープロセス

## 品質チェック結果

### TypeScript型チェック
```bash
yarn tsc --noEmit
```
**結果:** ✅ エラーなし

**修正した問題:**
- 未使用変数の削除（`electron/main.ts`の`require`）
- オプショナルパラメータの型安全な処理

### ESLintチェック
```bash
yarn lint
```
**結果:** ✅ エラーなし

**警告:** TypeScriptバージョン（5.8.3）がESLintの公式サポート外だが、動作に問題なし

### 動作確認
**開発サーバー:** ✅ 正常起動中
**ビルド:** プリロードスクリプトが正常にコンパイルされる

## 次のステップ

プリロードスクリプトの実装が完了したので、次は**フェーズ2-3: メインプロセスIPC実装**に進みます。

### 実装予定の機能
1. **`ipcMain.handle`ハンドラーの実装**
   - `file:open` - ファイル選択ダイアログとファイル読み込み
   - `file:save` - ファイル保存
   - `file:saveAs` - 名前を付けて保存

2. **Node.js APIの活用**
   - `fs/promises` - ファイルシステム操作
   - `electron.dialog` - ネイティブダイアログ表示

3. **エラーハンドリング**
   - ファイル操作エラーの適切な処理
   - ユーザーキャンセルの処理

### 準備が整った状態
- ✅ 型安全なAPI定義
- ✅ プリロードスクリプトによるAPI公開
- ✅ IPC通信チャンネルの定義
- ⏳ メインプロセスでのハンドラー実装（次のステップ）

## 注意点

### セキュリティ考慮事項
- **contextBridge**: Node.js APIへの直接アクセスを防ぐ
- **チャンネル検証**: 将来的にチャンネル名の検証を検討

### 型定義の同期
- プリロードスクリプトと`src/types/electron.d.ts`の型定義を同期保持
- 変更時は両方のファイルを更新する必要あり

### パフォーマンス
- `ipcRenderer.invoke`は非同期処理のため、UIブロックなし
- 大きなファイルの処理時は進捗表示を検討

この実装により、レンダラープロセスから型安全にファイル操作APIを呼び出す基盤が整いました。 