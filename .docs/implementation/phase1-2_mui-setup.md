# フェーズ1-2: MUIとTSS-Reactの基本セットアップ

このドキュメントは、必要なライブラリをインストールした後に行う、MUIとTSS-Reactの基本セットアップ作業をまとめたものです。

## 実施内容

### 1. 追加ライブラリのインストール

MUIアイコンパッケージが必要だったため、追加でインストールしました。

```bash
yarn add @mui/icons-material
```

**インストール結果:**
- `@mui/icons-material@7.2.0`

### 2. App.tsxの完全書き換え

`src/App.tsx`を完全に書き換えて、MUIの基本コンポーネントとTSS-Reactのスタイリングを適用しました。

**主な変更点:**
- テンプレートのサンプルコードを削除
- MUIの`ThemeProvider`、`CssBaseline`、`AppBar`を導入
- TSS-Reactの`makeStyles`でタイプセーフなスタイリング
- プロフェッショナルなアプリケーションレイアウトの構築

**実装したコンポーネント構成:**
```
ThemeProvider
├── CssBaseline
└── div (root container)
    ├── AppBar (fixed position)
    │   └── Toolbar
    │       ├── IconButton (MenuIcon)
    │       └── Typography (App Title)
    ├── Toolbar (spacer)
    └── Box (content area)
        └── Typography (Welcome message)
```

### 3. 不要ファイルの削除

MUIの`CssBaseline`を使用するため、従来のCSSファイルを削除しました。

**削除したファイル:**
- `src/App.css`
- `src/index.css`

**修正したファイル:**
- `src/main.tsx`: `import './index.css'`の行を削除

### 4. 実装したスタイリング

TSS-Reactの`makeStyles`を使用して、以下のスタイルを定義しました。

```typescript
const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: {
    // ツールバーの基本スタイル
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}))
```

**スタイリングの特徴:**
- フルハイト（100vh）のレイアウト
- 固定ヘッダーとスクロール可能なコンテンツエリア
- MUIテーマシステムとの完全な統合
- TypeScriptによる型安全性

### 5. MUIテーマの設定

カスタムテーマを作成し、アプリケーション全体に適用しました。

```typescript
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})
```

## 動作確認

### 開発サーバーの起動

```bash
yarn dev
```

**起動結果:**
- Local: http://localhost:5174/
- Electronアプリケーションが正常に起動
- MUIのモダンなUIが表示される

### 確認できる機能

✅ **レスポンシブなAppBar**
- 固定ヘッダーとして機能
- メニューアイコンとアプリケーションタイトルを表示

✅ **TSS-Reactによるスタイリング**
- 型安全なスタイル定義
- MUIテーマとの完全な統合

✅ **プロフェッショナルなレイアウト**
- 全画面レイアウト
- 中央配置のウェルカムメッセージ

## 次のステップ

フェーズ1の基本UIセットアップが完了しました。次はフェーズ2に進み、Electronの核心機能であるファイルI/Oの実装を行います。

### フェーズ2で実装予定の機能
1. プリロードスクリプトによるIPC通信
2. メインプロセスでのファイル操作
3. レンダラープロセスでのファイルメニュー

## 注意点

- MUIアイコンパッケージは必要に応じて追加インストールが必要
- TSS-Reactのスタイリングは、MUIテーマオブジェクトを活用することで一貫性を保つ
- 従来のCSSファイルは削除し、MUIのCssBaselineに一本化する

このセットアップにより、Lichtblickプロジェクトで使用されている技術スタックの基盤が整いました。 