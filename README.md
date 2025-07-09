# Mosaic Markdown Editor

![screenshot-placeholder](https://via.placeholder.com/800x500.png?text=App+Screenshot+Here)

**Mosaic Markdown Editor** は、Electron, React, TypeScript, Material-UIで構築された、パネル分割可能なクロスプラットフォームのMarkdownエディタです。

このプロジェクトは、ロボティクス可視化ツール [Lichtblick](https://github.com/lichtblick-suite/lichtblick) で採用されているような、モダンなデスクトップアプリケーションの技術スタックを学習するために開発されています。

## ✨ 主な機能

-   **リアルタイムプレビュー:** Markdownを書きながら、リアルタイムでHTMLプレビューを確認できます。
-   **パネルレイアウト:** `React Mosaic`により、エディタとプレビューのパネルを自由に分割・リサイズできます。
-   **ファイル操作:** OSネイティブのダイアログによるファイルの「開く」「保存」機能。
-   **ドラッグ＆ドロップ:** ファイルをウィンドウに直接ドラッグ＆ドロップして開くことができます。
-   **クロスプラットフォーム:** Windows, macOS, Linuxで動作します。

## 🛠️ 主要技術スタック

-   **Electron**: デスクトップアプリのフレームワーク
-   **React**: UIライブラリ
-   **TypeScript**: 型安全なJavaScript
-   **Vite**: 高速なフロントエンドビルドツール
-   **Material-UI (MUI)**: UIコンポーネントライブラリ
-   **TSS-React**: MUIと連携する型安全なCSS-in-JS
-   **React Mosaic**: タイル型ウィンドウレイアウトライブラリ
-   **React DnD**: ドラッグ＆ドロップ機能
-   **Electron-Builder**: アプリケーションのパッケージングとビルド

## 🚀 セットアップと開発

ローカル環境で開発を始めるには、以下の手順に従ってください。

**1. リポジトリをクローンする (またはプロジェクトを作成する)**

```bash
# このリポジトリをクローンする場合
# git clone https://github.com/your-username/mosaic-markdown-editor.git
# cd mosaic-markdown-editor

# npxで新規作成した場合、そのディレクトリに移動
cd mosaic-markdown-editor
```

**2. 依存関係をインストールする**

```bash
yarn install
```

**3. 開発モードでアプリを起動する**

```bash
yarn dev
```

## 📜 利用可能なスクリプト

-   `yarn dev`: 開発モードでアプリを起動します。ホットリロードが有効です。
-   `yarn build`: 現在のOS向けにアプリケーションをビルドし、配布可能なパッケージを作成します。出力先は `dist` ディレクトリです。

## 📝 今後の課題 (TODO)

-   [x] プロジェクトのセットアップと基本UIの構築
-   [ ] ファイルを開く/保存する機能の実装
-   [ ] `React Mosaic`によるパネルレイアウトの実装
-   [ ] Markdownリアルタイムプレビュー機能の実装
-   [ ] ファイルのドラッグ＆ドロップ機能の実装
-   [ ] `react-i18next`による多言語対応
-   [ ] `electron-store`による設定の永続化
-   [ ] Storybookの導入によるコンポーネント駆動開発
-   [ ] JestとReact Testing Libraryによるユニットテストの記述

## License

[MIT](LICENSE)# mosaic-markdown-editor
