# Clipgest Extension (extension/)

このディレクトリはブラウザ拡張の実装一式です。
`src/`のTypeScriptをViteでビルドして`dist/`へ出力します。

## ツリー構成と役割

```sh
extension/
├── package.json            # 依存関係/ビルド・監視コマンド
├── bun.lock                # 依存のロックファイル（削除しない）
├── tsconfig.json           # TypeScript設定
├── vite.config.ts          # src直下TSを全エントリにするVite設定
├── manifest.json           # 本番用マニフェスト
├── icons/                  # 拡張アイコン
├── dist/                   # ビルド成果物（vite buildで生成）
└── src/
  ├── background.ts         # 背景処理（保存/認証/メッセージ）
  ├── content-script.ts     # 画面側の通知受信とalert表示
  ├── api.ts                # バックエンドAPI呼び出し
  ├── auth.ts               # 認証状態やトークン処理
  ├── storage.ts            # Chrome storageへの保存
  └── web-auth-bridge.ts    # Web→拡張の認証ブリッジ
```

## ビルド

```sh
bun run build
```
