# Nani Desktop

AI翻訳デスクトップアプリケーション

[![Electron](https://img.shields.io/badge/Electron-33.2.1-blue)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-PRIVATE-red)](LICENSE.md)

## 📖 概要

Nani Desktopは、AI搭載のマルチ言語翻訳デスクトップアプリケーションです。テキスト翻訳、画像翻訳（OCR）、スクリーンキャプチャ、ファイル翻訳などをサポートしています。

## ✨ 主な機能

### 翻訳機能
- **テキスト翻訳**: AIによる高精度な翻訳
- **画像翻訳**: OCR機能で画像内のテキストを抽出して翻訳
- **ファイル翻訳**: PDF、テキストファイルを翻訳
- **スクリーンキャプチャ**: 画面領域を選択してキャプチャ＆翻訳

### 管理機能
- **翻訳履歴**: 過去の翻訳履歴の保存と検索
- **スタイルタグ**: 翻訳をカテゴリ分け
- **カスタム指示**: 翻訳スタイルのカスタマイズ
- **チャット形式**: 翻訳セッションをチャット形式で表示

### システム機能
- **自動アップデート**: バックグラウンドで更新をチェック
- **ホットキー**: キーボードショートカット対応
- **テーマ切り替え**: ライトモード/ダークモード
- **アクセシビリティ**: VoiceOver、キーボードナビゲーション対応

## 🛠 技術スタック

### フロントエンド
- **React 18**: UIフレームワーク
- **TypeScript**: 型安全な開発
- **Zustand**: 軽量ステート管理
- **Tailwind CSS v4**: ユーティリファーストCSS

### バックエンド
- **Electron 33**: デスクトップアプリケーションフレームワーク
- **better-sqlite3**: SQLiteデータベース
- **Drizzle ORM**: タイプセーフORM
- **electron-updater**: 自動アップデート

### 機能ライブラリ
- **@napi-rs/system-ocr**: OCR機能
- **@nut-tree-fork/nut-js**: スクリーンキャプチャ
- **@mozilla/readability**: Webページのコンテンツ抽出
- **file-type**: ファイルタイプ検出
- **valibot**: スキーマバリデーション

## 📁 プロジェクト構成

```
nani-desktop/
├── packages/repo-lib/         # 共有ライブラリ (monorepo)
│   ├── src/features/          # 機能モジュール
│   │   ├── basic-mode/        # 翻訳スキーマ
│   │   ├── app-settings/      # 設定スキーマ
│   │   └── theme/             # テーマスキーマ
│   └── src/utils/             # ユーティリティ
│       ├── generate-secure-id.ts
│       ├── supported-langs.ts
│       ├── in-app-hotkeys.ts
│       ├── common-schema.ts
│       └── jsonfetch.ts
│
├── src/
│   ├── main/                  # Electronメインプロセス
│   │   ├── db/                # データベーススキーマ
│   │   ├── capture-screen.ts  # スクリーンキャプチャ
│   │   ├── ocr.ts             # OCR機能
│   │   ├── file-handler.ts    # ファイル処理
│   │   ├── get-content-by-url.ts # Web取得
│   │   ├── api-client.ts      # API通信
│   │   ├── auto-update.ts     # 自動アップデート
│   │   ├── mac-accessibility.ts # Macアクセシビリティ
│   │   ├── ipc-handlers.ts    # IPCハンドラー
│   │   └── index.ts           # エントリーポイント
│   │
│   ├── preload/               # プリロードスクリプト
│   │   └── index.ts
│   │
│   ├── renderer/              # React UI
│   │   └── src/
│   │       ├── components/    # Reactコンポーネント
│   │       ├── stores/        # Zustandストア
│   │       ├── pages/         # ページ
│   │       ├── hooks/         # Reactフック
│   │       ├── utils/         # ユーティリティ
│   │       ├── styles/        # スタイル
│   │       └── App.tsx        # メインアプリ
│   │
│   └── types/                 # 型定義
│
├── drizzle/                   # データベースマイグレーション
├── resources/                 # リソースファイル
│   ├── icon.png
│   ├── icon.icns
│   ├── capture-overlay.html
│   └── ...
│
└── 設定ファイル群
```

## 🚀 セットアップ

### 環境要件

- **Node.js**: 18.x 以上
- **npm**: 9.x 以上
- **macOS**: 10.15 (Catalina) 以上
- **Windows**: Windows 10 以上
- **Linux**: Ubuntu 20.04 以上 (推奨)

### インストール

```bash
# リポジトリのクローン
cd /path/to/nani-desktop

# 依存関係のインストール
npm install

# 開発モードで実行
npm run dev

# ビルド
npm run build

# パッケージング
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## 🎮 ホットキー

| ホットキー | 機能 |
|-----------|------|
| `Cmd/Ctrl+N` | 新規翻訳 |
| `Cmd/Ctrl+Shift+U` | クイックアップロード |
| `Cmd/Ctrl+Shift+S` | スクリーンキャプチャ |
| `Cmd/Ctrl+H` | 履歴を開く |
| `Cmd/Ctrl+,` | 設定を開く |
| `Cmd/Ctrl+\`` | ウィンドウの表示/非表示 |
| `ESC` | モーダルを閉じる |

## 🗄 データベース

アプリケーションはSQLiteを使用しており、以下のテーブルを含んでいます：

### basic_translate
翻訳セッションを管理するメインテーブル
- `id`: 一意識別子
- `sourceText`: 翻訳元テキスト
- `sourceLang`: 翻訳元言語
- `toLang`: 翻訳先言語
- `translationExcerpt`: 翻訳結果の抜粋
- `createdAt`: 作成日時
- `tagsDump`: タグ情報
- 他多数のフィールド

### basic_translate_message
翻訳チャットのメッセージ履歴
- `id`: メッセージID
- `role`: ロール（user/assistant/system）
- `content`: メッセージ内容
- `basicTranslateId`: 翻訳セッションID

### localkv
ローカルキーバリューストア
- `key`: キー
- `value`: 値
- `updatedAt`: 更新日時

## 🌐 サポート言語

英語、日本語、韓国語、中国語、スペイン語、フランス語、ドイツ語、イタリア語、ポルトガル語、ロシア語、アラビア語、ヒンディー語、タイ語、ベトナム語、インドネシア語

## 🔧 設定

### アプリケーション設定

アプリの設定は以下の方法で変更できます：

1. **メニュー**: `Cmd/Ctrl+,` で設定ページを開く
2. **設定ファイル**: `~/Library/Application Support/Nani/nani.db`

### 設定項目

- **テーマ**: ライト/ダーク/自動
- **言語**: UI言語
- **デフォルト翻訳元言語**: 翻訳元のデフォルト言語
- **デフォルト翻訳先言語**: 翻訳先のデフォルト言語
- **OCRを有効にする**: 画像からのテキスト抽出
- **ホットキーを有効にする**: キーボードショートカット
- **自動アップデート**: 自動更新チェック
- **メニューバーを表示**: メニューバーの表示/非表示

## 📊 開発

### ディレクトリ構造

- `src/main/`: Electronメインプロセス
- `src/renderer/`: React UI
- `src/preload/`: プリロードスクリプト
- `packages/repo-lib/`: 共有ライブラリ

### スクリプト

```bash
# 開発
npm run dev              # 開発モードで起動

# ビルド
npm run build            # プロダクションビルド
npm run preview          # ビルド結果をプレビュー

# パッケージング
npm run build:mac        # macOS用パッケージ
npm run build:win        # Windows用パッケージ
npm run build:linux      # Linux用パッケージ

# その他
npm run lint             # ESLint
npm run typecheck        # TypeScript型チェック
```

## 🐛 トラブルシューティング

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# outディレクトリを削除して再ビルド
rm -rf out
npm run build
```

### アプリケーションが起動しない

```bash
# ログを確認
~/Library/Logs/Nani/main.log
```

### データベースエラー

```bash
# データベースをリセット（警告: 全データが消えます）
rm ~/Library/Application\ Support/Nani/nani.db
```

## 📝 ライセンス

PRIVATE - 著作権はkiokuに帰属します

## 🤝 貢献

このプロジェクトはプライベートリポジトリです。貢献をご希望の場合は、オーナーにお問い合わせください。

## 📧 サポート

バグ報告や機能リクエストは、アプリ内の「サポートに連絡」から、または以下の方法でお問い合わせください：

- Email: support@nani.kiok.jp
- Web: https://nani.kiok.jp

---

**バージョン**: 1.0.59
**最終更新**: 2025年1月21日
**開発者**: kioku
