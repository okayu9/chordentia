# Chordentia

コード名から構成音を確認したり、選んだ音からコード候補を探したりするための小さなWebアプリです。

https://chordentia.okayu.jp/

## 機能

- コード名から構成音を表示
- 構成音からコード候補を推定
- スラッシュコードの入力と候補表示
- シャープ表記とフラット表記の切り替え
- Web Audio API によるコード/単音の再生
- Triangle、Sawtooth、Square、Organ の音色切り替え

対応例:

```text
C
Am7
G7
Cmaj7
Dm7b5
Caug
Faug7/B
C6/9
C7alt
G7(b5,#9)
Comit3
Cadd9
C/G
C##maj7
```

## 使い方

```bash
npm install
npm run build
```

ビルド後、`dist/index.html` をブラウザで開きます。成果物はCSSとJavaScriptを含んだ単一HTMLファイルです。

開発中にTypeScriptのコンパイルを監視する場合:

```bash
npm run dev
```

## 開発

必要な環境:

- Node.js 18+
- npm 8+

主なコマンド:

```bash
npm run typecheck      # TypeScriptの型チェック
npm run lint           # ESLint
npm run format:check   # Prettierチェック
npm test               # Jest
npm run test:e2e       # build後にPlaywright E2E
npm run build          # 本番用の単一HTMLを生成
npm run ci             # lint + format + test + build
```

## 構成

```text
src/
  app.ts                       UIとアプリケーション状態
  music-theory.ts              コード解析、候補推定、音名処理
  chord-registry-complete.ts   コード定義とエイリアス正規化
  audio-player.ts              Web Audio APIによる再生
  constants/                   定数
  utils/                       DOMユーティリティ
  index.html                   HTMLテンプレート
  styles.css                   スタイル

scripts/
  build-bundle.cjs             esbuildによるバンドル
  create-prod-html.cjs         CSS/JS/ファビコンのインライン化
  cleanup-dist.cjs             distの不要ファイル削除
  validate-build.cjs           ビルド成果物の検証

tests/
  music-theory.test.ts         音楽理論ロジックの単体テスト
  e2e/                         Playwright E2E
```

## 実装メモ

コード定義は `CHORD_REGISTRY` に集約しています。新しいコード品質を追加する場合は、レジストリに interval と alias を追加し、必要に応じて単体テストを足してください。

候補推定は、選択された音を各ルート候補とコード定義に照合し、完全一致、部分一致、シンプルさの順で並べます。音名比較では異名同音を正規化して扱います。

## ライセンス

このリポジトリにはライセンスファイルがありません。利用条件を明確にする場合は `LICENSE` を追加してください。
