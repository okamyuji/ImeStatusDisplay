# キーボードイベント・IME状態リアルタイム表示

このプロジェクトは、テキスト入力時のキーボードイベントとIME（Input Method Editor）の状態をリアルタイムで表示するWebアプリケーションです。

## 機能

- IMEの状態（ON/OFF）のリアルタイム表示
    - 定期的な状態チェックによる正確な状態表示
    - Safari等のブラウザ固有の挙動に対応
- キーボードイベントのリアルタイム表示
    - 特殊キー（Enter、Backspace、Delete、Tab）
    - 矢印キー（上下左右）
    - 修飾キー（Ctrl、Alt、Meta）との組み合わせ
    - 通常のキー入力
    - IMEの開始と確定状態
- キーイベント情報の自動クリア（3秒後）

## セットアップ

1. 必要な環境
   - Node.js（TypeScriptをグローバルにインストールする場合）
   - TypeScript（`npm install -g typescript`）

2. プロジェクトのビルド

   ```bash
   # TypeScriptのコンパイル
   tsc js/script.ts
   ```

3. 実行方法
   - `index.html` をWebブラウザで開くだけで動作します
   - ローカルサーバーを使用する場合は、お好みのHTTPサーバーを使用してください

## 実装詳細

### ファイル構成

- `index.html`: メインのHTMLファイル
- `js/script.ts`: TypeScriptソースコード
- `js/script.js`: コンパイル後のJavaScriptファイル
- `tsconfig.json`: TypeScriptの設定ファイル

### イベントハンドリング

1. IME状態の検出
   - `compositionstart`: IME入力開始時のイベント
   - `compositionend`: IME入力確定時のイベント
   - `input`: テキスト入力時のイベント（IMEの状態も検出）
   - 定期的な状態チェック（100ミリ秒間隔）
   - 入力タイムスタンプによる状態管理

2. キーボードイベントの検出
   - `keydown`: キー押下時のイベント
   - `blur`: フォーカス喪失時のイベント
   - 以下の状態を検出：
     - IME入力中（`isComposing`または`key === 'Process'`）
     - 特殊キー（Enter、Backspace、Delete、Tab）
     - 矢印キー
     - 修飾キーとの組み合わせ

### TypeScript実装のポイント

```typescript
// IME状態の管理
let isComposing: boolean = false;
let lastInputTime: number = 0;
const IME_CHECK_INTERVAL: number = 100;

// 定期的な状態チェック
setInterval(() => {
  const now = Date.now();
  if (now - lastInputTime > 500 && isComposing) {
    // IMEの状態を再確認
    if (!textInput.matches(':has(> *)') && !document.activeElement?.matches(':has(> *)')) {
      isComposing = false;
      updateIMEStatus('OFF');
    }
  }
}, IME_CHECK_INTERVAL);

// IMEタイプの定義
const imeTypes = [
  'insertCompositionText',
  'deleteCompositionText',
  'insertFromComposition',
  'deleteByComposition'
];

// イベント処理
if (inputEvent.inputType && imeTypes.indexOf(inputEvent.inputType) !== -1) {
  isComposing = true;
  updateIMEStatus('ON');
}
```

### UI更新の仕組み

- IME状態とキーイベント情報は別々のラベルで表示
- キーイベント情報は3秒後に自動的にクリア
- スタイリングはCSSで管理（フレックスボックスレイアウト使用）
- タイムスタンプベースの状態管理による正確な表示

## ブラウザ互換性

- モダンブラウザ（Chrome、Firefox、Safari、Edge）で動作確認済み
- Safari固有のIMEイベント挙動に対応
- 定期的な状態チェックによりブラウザ間の差異を吸収

## 注意事項

- IMEの状態検出は、ブラウザやIMEの実装によって挙動が異なる場合があります
- キーイベントの一部は、ブラウザのセキュリティ設定によってブロックされる可能性があります
- 定期的な状態チェックにより、CPU使用率が若干上昇する可能性があります
