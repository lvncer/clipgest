# Clipgest Browser Extension

ブラウジング中に気になったリンクを、PC の右クリックから一瞬で保存できるブラウザ拡張機能です。

## インストール（推奨）

- Chrome Web Store: [https://chromewebstore.google.com/detail/quicklinks](https://chromewebstore.google.com/detail/quicklinks/jofhehfnmliefoipncjbimmomenmegmj?authuser=0&hl=ja&pli=1)

1. 上のリンクを開く
2. 「Chrome に追加」をクリック
3. 権限を確認して追加

> 現在の対応ブラウザ: Google Chrome

## 使い方

1. Web アプリにログイン（Clerk）
2. 任意のウェブページでリンクを右クリック
3. コンテキストメニューから「Save link to Clipgest.」を選択
4. 「link saved!」と表示されれば成功

## 開発者向け（ローカルで読み込む）

Chrome Web Store を使わずに、ソースコードからローカル読み込みしたい場合の手順です。

### 1. リポジトリの取得

```bash
git clone https://github.com/lvncer/clipgest.git
```

### 2. 拡張機能のビルド（`dist/` の作成）

`manifest.json` から参照されるビルド済みスクリプトは `extension/dist/` に出力されます。

```bash
cd extension
bun install
bun run build
```

### 3. Chrome にロード（unpacked）

1. Chrome で `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `/extension` フォルダを選択
