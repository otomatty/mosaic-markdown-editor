# フェーズ4-1: 国際化(i18n)実装

## 実施内容

### 作業概要
React-i18nextライブラリを使用して、日本語・英語の言語切り替え機能を実装。全てのUIコンポーネントを国際化対応し、ヘッダーに言語切り替えメニューを追加。

### 実装した機能
1. **i18n基盤構築**
   - `react-i18next`、`i18next`、`i18next-browser-languagedetector`の導入
   - 言語設定ファイルの作成
   - ブラウザ言語検出機能の設定

2. **翻訳ファイル作成**
   - 日本語翻訳ファイル（`ja.json`）の作成
   - 英語翻訳ファイル（`en.json`）の作成
   - 階層的な翻訳キー構造の設計

3. **全コンポーネントの国際化対応**
   - AppHeader: メニューとタイトルの国際化
   - FileMenu: ファイル操作メニューの国際化
   - EditorPanel: エディタ部分の国際化
   - PreviewPanel: プレビュー部分の国際化
   - DropTargetOverlay: ドラッグ&ドロップ表示の国際化
   - WelcomeScreen: ウェルカム画面の国際化
   - App.tsx: 通知メッセージの国際化

4. **言語切り替え機能**
   - ヘッダーに言語切り替えメニューを追加
   - 言語設定の永続化（localStorage）
   - 動的言語切り替え機能

### 修正・追加したファイル
- `src/i18n/index.ts`: 新規作成
- `src/i18n/locales/ja.json`: 新規作成
- `src/i18n/locales/en.json`: 新規作成
- `src/main.tsx`: i18n初期化の追加
- `src/App.tsx`: 国際化対応とMarkdownパース修正
- `src/components/AppHeader/AppHeader.tsx`: 言語切り替えメニューの追加
- `src/components/FileMenu/FileMenu.tsx`: 国際化対応
- `src/components/EditorPanel.tsx`: 国際化対応
- `src/components/PreviewPanel.tsx`: 国際化対応
- `src/components/DropTargetOverlay.tsx`: 国際化対応
- `src/components/WelcomeScreen.tsx`: 国際化対応と機能強化

## 技術的な判断

### React-i18nextライブラリの選択理由
1. **業界標準**: React.js向けの最も主流な国際化ライブラリ
2. **豊富な機能**: 動的言語切り替え、変数埋め込み、ネストした翻訳キー対応
3. **TypeScript対応**: 型安全な国際化実装が可能
4. **永続化機能**: ブラウザ言語検出とlocalStorageによる設定保存

### 翻訳キー設計の方針
```typescript
{
  "menu": {
    "file": "ファイル",
    "openFile": "ファイルを開く"
  },
  "notification": {
    "fileOpened": "ファイルを開きました: {{filename}}"
  }
}
```

**特徴:**
- **階層構造**: 機能別にグループ化した翻訳キー
- **変数埋め込み**: `{{variable}}`形式による動的な文字列生成
- **一貫性**: 同じ機能は同じキーグループに配置
- **拡張性**: 新機能の追加が容易な構造

### 言語切り替え機能の実装
```typescript
const handleLanguageChange = (language: string) => {
  i18n.changeLanguage(language)
  handleLanguageMenuClose()
}
```

**設計上の特徴:**
- **即座反映**: 言語切り替え後すぐにUIが更新
- **永続化**: localStorage自動保存による設定維持
- **フォールバック**: 未対応言語時は日本語に自動切り替え
- **ブラウザ検出**: 初回アクセス時はブラウザ言語を検出

## 実装詳細

### i18n設定ファイル
```typescript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja', // デフォルト言語は日本語
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })
```

### 翻訳ファイル構造
```json
{
  "appName": "Mosaic Markdown Editor",
  "menu": { ... },
  "editor": { ... },
  "preview": { ... },
  "notification": { ... },
  "dragDrop": { ... },
  "welcome": { ... },
  "common": { ... }
}
```

### useTranslationフックの使用
```typescript
const { t, i18n } = useTranslation()

// 基本的な翻訳
{t('menu.file')}

// 変数埋め込み
showNotification(t('notification.fileOpened', { filename: result.filePath }), 'success')

// 言語切り替え
i18n.changeLanguage('en')
```

### 言語切り替えメニュー
```typescript
<Menu
  anchorEl={languageMenuAnchor}
  open={Boolean(languageMenuAnchor)}
  onClose={handleLanguageMenuClose}
>
  <MenuItem onClick={() => handleLanguageChange('ja')}>
    {t('menu.japanese')}
  </MenuItem>
  <MenuItem onClick={() => handleLanguageChange('en')}>
    {t('menu.english')}
  </MenuItem>
</Menu>
```

## 品質チェック結果

### TypeScript型チェック
```bash
$ yarn tsc --noEmit
✨  Done in 1.81s.
```
**結果**: ✅ エラーなし

### ESLintチェック
```bash
$ yarn lint
✨  Done in 1.03s.
```
**結果**: ✅ エラーなし（TypeScriptバージョン警告は既知の問題）

### 動作確認
```bash
$ yarn dev
```
**結果**: ✅ 正常に起動・動作確認完了

### 新機能の動作確認
- ✅ 言語切り替えメニューの表示
- ✅ 日本語⇔英語の言語切り替え
- ✅ 全コンポーネントの翻訳表示
- ✅ 通知メッセージの国際化
- ✅ 言語設定の永続化
- ✅ ブラウザ言語検出

## 次のステップ

### 完了した作業
- [x] react-i18nextライブラリの導入
- [x] i18n設定ファイルの作成
- [x] 日本語・英語翻訳ファイルの作成
- [x] 全コンポーネントの国際化対応
- [x] 言語切り替えメニューの実装
- [x] 品質チェック完了

### フェーズ4-1の完了
- [x] 国際化(i18n)実装の完了
- [x] 動的言語切り替え機能
- [x] 翻訳ファイルによる多言語対応
- [x] 言語設定の永続化

### 次のフェーズ準備
- [x] フェーズ4-2: 新規ファイル作成機能の実装完了 [実装詳細](./phase4-2_new-file-creation.md)
- [ ] フェーズ4-3: 設定永続化機能の実装準備
- [ ] electron-storeライブラリの活用
- [ ] ウィンドウサイズ・位置の保存機能
- [ ] 言語設定の永続化
- [ ] パネルレイアウトの永続化

### 将来の拡張可能性
1. **新言語の追加**: 翻訳ファイルを追加するだけで新言語対応
2. **プラグラル形式**: 複数形の翻訳対応
3. **日時形式**: 各言語の日時形式対応
4. **右書き言語**: アラビア語・ヘブライ語等の対応

## 注意点

### 開発者向け注意事項

1. **翻訳キーの命名**: 階層構造を維持し、機能別にグループ化
2. **変数の型安全性**: 翻訳テンプレート内の変数は適切な型チェック
3. **フォールバック**: 未翻訳キーの場合の処理を考慮
4. **パフォーマンス**: useTranslationフックの使いすぎに注意

### 既知の制限事項

1. **言語検出精度**: ブラウザ言語検出の精度に依存
2. **翻訳品質**: 機械翻訳ではなく、手動翻訳による品質管理
3. **RTL対応**: 右書き言語には未対応
4. **プラグラル**: 複数形の翻訳は現在未対応

### トラブルシューティング

1. **翻訳が表示されない**: 翻訳キーの存在確認
2. **言語切り替えが効かない**: localStorageの設定確認
3. **変数埋め込みエラー**: 変数名の一致確認
4. **型エラー**: useTranslationフックの適切な使用

### パフォーマンス考慮事項

1. **翻訳ファイルサイズ**: 大きくなりすぎないよう定期的な整理
2. **メモリ使用量**: 全翻訳をメモリに保持
3. **初期化時間**: i18n初期化の最適化
4. **レンダリング**: 言語切り替え時の再レンダリング

この国際化機能の実装により、フェーズ4-1「国際化(i18n)実装」が完了し、アプリケーションが日本語・英語に対応した、より実用的なソフトウェアになりました。ユーザーが使いやすい言語でアプリケーションを利用できるようになり、国際的な利用も可能になりました。 