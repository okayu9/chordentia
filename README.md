# Chordentia 🎵

**コードの構成音を見て、聴いて、学ぶ** - インタラクティブなコード解析ツール

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-FF6B35?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Single File](https://img.shields.io/badge/Single%20File-41KB-brightgreen?style=for-the-badge)](dist/index.html)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Tested-00C7AC?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

## 🎯 機能

### 🎼 コード解析
- **コード → 構成音**: コード名を入力して構成音を表示・再生
- **構成音 → コード**: 音符を選択してコードを推定
- **豊富なコード対応**: 80+のコード品質に対応（メジャー、マイナー、7th、テンション、オルタードなど）
- **ベース音指定**: オンコード（スラッシュコード）の完全サポート
- **aug7コード対応**: Augmented 7thコードの完全認識

### 🎵 音声機能
- **リアルタイム再生**: Web Audio APIによる高品質な音声合成
- **4つの音色**: Triangle、Sawtooth、Square、Organ音色
- **視覚的フィードバック**: 再生時のアニメーション効果
- **一貫した再生**: ベース音指定を考慮した統一された音声出力

### 🎨 ユーザー体験
- **モダンUI**: ガラスモーフィズムエフェクトによる美しいデザイン
- **レスポンシブ**: デスクトップ・モバイル対応
- **表記切替**: シャープ・フラット記法の切り替え
- **直感的操作**: ワンクリックでコード再生
- **スマート提案**: ルート音をベースにした適切なコード推奨

### 🎺 対応コード（例）
```
基本: C, Am, F#, Bb
7th: Cmaj7, Am7, G7, Dm7b5
Augmented: Caug, Faug7, Caug/E
テンション: C(9), Am7(11), G7(13)
オルタード: C7alt, G7(b5,#9)
省略: Comit3, Fomit5
付加: Cadd9, Fadd2, Gadd6
特殊: C6/9, Csus4, mM7
スラッシュ: C/G, Am7/E, F7/B
ダブル変化記号: C##, B𝄫𝄫, F##maj7
```

## 🚀 クイックスタート

### オンラインで使用
最新バージョンは[こちら](https://chordentia.okayu.jp/)で利用できます

### ローカル実行
```bash
# リポジトリをクローン
git clone https://github.com/okayu9/chordentia.git
cd chordentia

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev

# または本番ビルド
npm run build
# dist/index.html をブラウザで開く
```

## 🛠️ 開発

### 前提条件
- Node.js 18+
- npm 8+

### コマンド一覧
```bash
# 開発
npm run dev          # 開発モード（TypeScript監視）
npm run build:dev    # 開発ビルド（TypeScriptコンパイルのみ）

# 本番
npm run build        # 本番ビルド（esbuild + 最適化 + 単一ファイル化）
npm run bundle       # esbuildバンドル作成

# テスト
npm test             # Jest実行
npm run test:watch   # テスト監視モード
npm run test:coverage # カバレッジレポート

# E2Eテスト
npm run test:e2e     # Playwright E2Eテスト実行
npm run test:e2e:ui  # E2EテストUI実行
npm run test:e2e:debug # E2Eテストデバッグ

# コード品質
npm run lint         # ESLint実行
npm run format       # Prettier実行
npm run typecheck    # TypeScript型チェック
npm run ci           # CI パイプライン（lint + format + test + build）
```

### モダンビルドシステム
- **esbuild**: 高速バンドリング・最適化
- **単一HTMLファイル**: CSS・JavaScript・ファビコンをすべてインライン化
- **外部依存なし**: 完全にスタンドアロン
- **どこでも実行可能**: ローカル・Web・CDN対応

## 📁 プロジェクト構造

```
chordentia/
├── src/                          # TypeScriptソース
│   ├── types.ts                 # 型定義（Note, ChordQuality等）
│   ├── music-theory.ts          # 音楽理論エンジン
│   ├── chord-registry-complete.ts # 統一コードレジストリ（80+コード）
│   ├── audio-player.ts          # Web Audio API実装
│   ├── app.ts                   # メインアプリケーション
│   ├── constants/               # 定数定義
│   ├── utils/                   # ユーティリティ関数
│   ├── index.html               # HTMLテンプレート
│   ├── styles.css               # スタイルシート
│   └── favicon.svg              # ファビコン
├── tests/                        # テストファイル
│   ├── music-theory.test.ts     # Jest単体テスト
│   ├── setup.ts                 # Jest設定
│   └── e2e/                     # Playwright E2Eテスト
│       ├── chord-recognition.spec.ts # コード認識テスト
│       ├── bass-note-functionality.spec.ts # ベース音機能テスト
│       └── audio-functionality.spec.ts # オーディオ機能テスト
├── scripts/                      # ビルドスクリプト
│   ├── build-bundle.cjs         # esbuildバンドラー
│   ├── create-prod-html.cjs     # HTML生成・最適化
│   ├── cleanup-dist.cjs         # ビルド後クリーンアップ
│   └── validate-build.cjs       # ビルド検証
├── dist/                         # ビルド出力
│   └── index.html               # 単一ファイル（最適化済み）
├── playwright.config.ts         # Playwright設定
└── package.json                 # プロジェクト設定
```

## 🎼 音楽理論の実装

### 統一コードレジストリ
- **80+コード定義**: 包括的なコードライブラリ
- **型安全性**: TypeScriptによる厳密な型チェック
- **正規化システム**: 異なる表記の統一（7+5 → aug7）
- **エイリアス対応**: 複数の表記法に対応

### コード認識アルゴリズム
1. **音程解析**: 選択された音の音程関係を計算
2. **パターンマッチング**: 豊富なコードパターンと照合
3. **ベース音処理**: インバージョン vs スラッシュコードの判定
4. **完全一致優先**: 選択音とコード構成音が完全一致するものを優先
5. **シンプルさスコア**: より単純なコードを上位に表示
6. **ダブル変化記号対応**: ##と𝄫𝄫を含む全ての音符の正確な認識

## 🧪 テスト

包括的なテストスイートでコード品質を保証：

### 単体テスト（Jest）
```bash
npm test                    # 全テスト実行
npm run test:watch         # ファイル変更を監視
npm run test:coverage      # カバレッジレポート
```

**テスト対象:**
- ✅ 基本コード解析（メジャー・マイナー・7th）
- ✅ 複雑なコード（テンション・オルタード・省略）
- ✅ Augmented 7thコード
- ✅ オンコード処理
- ✅ ベース音優先ロジック
- ✅ 表記正規化（シャープ・フラット・ダブル変化記号）
- ✅ エラーハンドリング

### E2Eテスト（Playwright）
```bash
npm run test:e2e           # 全ブラウザテスト
npm run test:e2e:ui        # UIモード
npm run test:e2e:debug     # デバッグモード
```

**テスト対象:**
- ✅ **75テスト** x **3ブラウザ** = **225検証項目**
- ✅ **Chromium, Firefox, WebKit** クロスブラウザ対応
- ✅ **コード認識機能**: 入力・選択・記譜法切り替え
- ✅ **ベース音機能**: スラッシュコード・インバージョン
- ✅ **オーディオ機能**: 再生・音色選択・視覚フィードバック
- ✅ **実ブラウザ環境**: 実際のユーザー操作をシミュレーション

## 🌐 デプロイ

### 単一ファイルデプロイ
`npm run build`後、`dist/index.html`をデプロイ：

- **GitHub Pages**: ファイルをアップロード
- **Netlify**: ドラッグ&ドロップ
- **Vercel**: 単一ファイルデプロイ
- **任意のWebサーバー**: HTMLファイルをコピー
- **ローカル使用**: ブラウザで直接開く

### 最適化
- **esbuild**: 高速バンドリング・Tree Shaking
- **Terser**: JavaScript最適化
- **CleanCSS**: CSS最適化
- **HTML Minifier**: HTML最適化
- **フォント**: Google Fonts CDN
- **完全スタンドアロン**: 外部依存なし

## 🔧 技術スタック

| 技術 | 用途 | バージョン |
|------|------|-----------|
| **TypeScript** | 型安全性・開発体験 | 5.0+ |
| **esbuild** | 高速バンドリング・最適化 | 0.25+ |
| **Web Audio API** | リアルタイム音声合成 | ネイティブ |
| **ES2020** | モダンJavaScript | ネイティブ |
| **Jest** | 単体テストフレームワーク | 29.0+ |
| **Playwright** | E2Eテストフレームワーク | 1.53+ |
| **ESLint** | コード品質 | 8.0+ |
| **Prettier** | コードフォーマット | 3.0+ |

## 🏗️ アーキテクチャの特徴

### 🎯 **型安全性**
- **厳密なTypeScript設定**: すべての型を明示的に定義
- **コンパイル時エラー検出**: 実行時エラーの事前防止
- **IntelliSense対応**: 開発効率の向上

### ⚡ **高性能**
- **esbuild**: 従来の10-100倍高速なビルド
- **Tree Shaking**: 未使用コードの自動除去
- **最適化されたバンドル**: 単一ファイル41KB

### 🧪 **高品質**
- **100%テストカバレッジ**: すべての重要機能をテスト
- **クロスブラウザ検証**: 主要3ブラウザでの動作保証
- **継続的インテグレーション**: 自動化されたテスト・ビルド

### 🔧 **保守性**
- **モジュラー設計**: 機能別の明確な分離
- **統一コードレジストリ**: 一元化されたコード定義
- **包括的なドキュメント**: コード・アーキテクチャの詳細説明

## 📝 最新の更新

### v2.0.0 (2025-06-19)
- **🎵 aug7コード対応**: Augmented 7thコードの完全サポート
- **🎯 ベース音機能強化**: スラッシュコード・インバージョンの改善
- **🏗️ アーキテクチャ刷新**: 統一コードレジストリによる大規模リファクタリング
- **⚡ モダンビルド**: esbuildによる高速ビルドシステム
- **🧪 E2Eテスト**: Playwrightによる包括的な品質保証

## 👤 作者

**Yumeto Inaoka**
- Website: [okayu.jp](https://okayu.jp)
- GitHub: [@okayu9](https://github.com/okayu9)

---

<div align="center">

**🎵 音楽理論の学習とコード解析を、より直感的で楽しく 🎵**

Made with ❤️ by [Yumeto Inaoka](https://okayu.jp)

</div>