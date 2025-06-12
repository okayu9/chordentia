# Chordentia 🎵

**コードの構成音を見て、聴いて、学ぶ** - インタラクティブなコード解析ツール

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-FF6B35?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Single File](https://img.shields.io/badge/Single%20File-25KB-brightgreen?style=for-the-badge)](dist/index.html)

## 🎯 機能

### 🎼 コード解析
- **コード → 構成音**: コード名を入力して構成音を表示・再生
- **構成音 → コード**: 音符を選択してコードを推定
- **豊富なコード対応**: 多様なコード品質に対応（メジャー、マイナー、7th、テンション、オルタードなど）
- **ベース音指定**: オンコード（スラッシュコード）の完全サポート

### 🎵 音声機能
- **リアルタイム再生**: Web Audio APIによる高品質な音声合成
- **4種類の音色**: サイン波、三角波、ノコギリ波、矩形波
- **一貫した再生**: ベース音指定を考慮した統一された音声出力

### 🎨 ユーザー体験
- **モダンUI**: ガラスモーフィズムエフェクトによる美しいデザイン
- **レスポンシブ**: デスクトップ・モバイル対応
- **表記切替**: シャープ・フラット記法の切り替え
- **直感的操作**: ワンクリックでコード再生

### 🎺 対応コード（例）
```
基本: C, Am, F#, Bb
7th: Cmaj7, Am7, G7, Dm7b5
テンション: C(9), Am7(11), G7(13)
オルタード: C7alt, G7(b5,#9)
省略: Comit3, Fomit5
付加: Cadd9, Fadd2, Gadd6
特殊: C6/9, Csus4, Caug
スラッシュ: C/G, Am7/E, F/C
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
- Node.js 16+
- npm 8+

### コマンド一覧
```bash
# 開発
npm run dev          # 開発モード（ファイル監視）
npm run build:dev    # 開発ビルド（TypeScriptコンパイルのみ）

# 本番
npm run build        # 本番ビルド（最適化・ミニファイ・単一ファイル化）

# テスト
npm test             # Jest実行
npm run test:watch   # テスト監視モード
npm run test:coverage # カバレッジレポート

# コード品質
npm run lint         # ESLint実行
npm run format       # Prettier実行
npm run typecheck    # TypeScript型チェック
```

### シングルファイル出力
本番ビルドは**完全にスタンドアロンな単一HTMLファイル**を生成：
- CSS・JavaScript・ファビコンをすべてインライン化
- 外部依存なし
- どこでも実行可能（ローカル・Web・CDN）

## 📁 プロジェクト構造

```
chordentia/
├── src/                      # TypeScriptソース
│   ├── types.ts             # 型定義（Note, ChordQuality等）
│   ├── music-theory.ts      # 音楽理論ロジック
│   ├── audio-player.ts      # Web Audio API実装
│   ├── app.ts               # メインアプリケーション
│   ├── index.html           # HTMLテンプレート
│   ├── styles.css           # スタイルシート
│   └── favicon.svg          # ファビコン
├── tests/                    # テストファイル
│   ├── music-theory.test.ts # 音楽理論テスト
│   └── setup.ts             # テスト設定
├── scripts/                  # ビルドスクリプト
│   ├── create-bundle.cjs    # JS バンドル作成
│   ├── create-prod-html.cjs # HTML生成・最適化
│   ├── cleanup-dist.cjs     # ビルド後クリーンアップ
│   └── validate-build.cjs   # ビルド検証
├── dist/                     # ビルド出力
│   └── index.html           # 単一ファイル（最適化済み）
└── package.json             # プロジェクト設定
```

## 🎼 音楽理論の実装

### コード認識アルゴリズム
1. **音程解析**: 選択された音の音程関係を計算
2. **パターンマッチング**: 豊富なコードパターンと照合
3. **完全一致優先**: 選択音とコード構成音が完全一致するものを優先
4. **シンプルさスコア**: より単純なコードを上位に表示
5. **ベース音考慮**: オンコードの適切な処理

## 🧪 テスト

包括的なテストスイートでコード品質を保証：

```bash
npm test                    # 全テスト実行
npm run test:watch         # ファイル変更を監視
npm run test:coverage      # カバレッジレポート
```

### テスト対象
- ✅ 基本コード解析（メジャー・マイナー・7th）
- ✅ 複雑なコード（テンション・オルタード・省略）
- ✅ オンコード処理
- ✅ ベース音優先ロジック
- ✅ 表記正規化（シャープ・フラット）
- ✅ エラーハンドリング

## 🌐 デプロイ

### 単一ファイルデプロイ
`npm run build`後、`dist/index.html`をデプロイ：

- **GitHub Pages**: ファイルをアップロード
- **Netlify**: ドラッグ&ドロップ
- **Vercel**: 単一ファイルデプロイ
- **任意のWebサーバー**: HTMLファイルをコピー
- **ローカル使用**: ブラウザで直接開く

### CDN最適化
- フォント：Google Fonts CDN
- 外部依存：なし
- 軽量な単一ファイル（高度に最適化済み）

## 🔧 技術スタック

| 技術 | 用途 | バージョン |
|------|------|-----------|
| TypeScript | 型安全性・開発体験 | 5.0+ |
| Web Audio API | リアルタイム音声合成 | ネイティブ |
| ES2020 | モダンJavaScript | ネイティブ |
| Terser | JavaScript最適化 | 5.0+ |
| CleanCSS | CSS最適化 | 5.0+ |
| Jest | テストフレームワーク | 29.0+ |

## 👤 作者

**Yumeto Inaoka**
- Website: [okayu.jp](https://okayu.jp)
- GitHub: [@okayu9](https://github.com/okayu9)