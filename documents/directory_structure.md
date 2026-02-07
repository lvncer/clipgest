# 将来的なファイルツリー（完成系イメージ）

最終的に目指すモノレポ構成のイメージ。
実際の実装時には細かいファイル名は変わる可能性があるが、レイヤー構造と責務の単位感を示す。

## /

```sh
/
 ├── README.md
 ├── package.json        # ルート共通ツール
 ├── bun.lock            # ルート bun 用ロックファイル
 ├── biome.json          # Biome 設定
 ├── docker-compose.yml  # API + Web を同時起動する docker compose 設定
 ├── .dockerignore       # Docker ビルド用の ignore 設定
 ├── .gitignore
 ├── .husky/
 │  └── pre-commit       # lint-staged を呼ぶフック
 ├── public/images/
 ├── documents/
 └── .github/
    ├── dependabot.yml
    └── workflows/
      ├── ci.yml
      └── dependabot-automerge.yml  # Dependabot PR の自動マージ用ワークフロー
...
```

## extension

```sh
extension/
 ├── package.json          # 依存関係/ビルド・監視コマンド
 ├── bun.lock              # 依存のロックファイル
 ├── tsconfig.json         # TypeScript 設定
 ├── vite.config.ts        # src 直下 TS を全エントリにする Vite 設定
 ├── manifest.json         # 本番用マニフェスト
 ├── icons/                # 拡張アイコン
 ├── dist/                 # ビルド成果物 （vite build で生成）
 └── src/
   ├── background.ts       # 背景処理 （保存/認証/メッセージ）
   ├── content-script.ts   # 画面側の通知受信と alert 表示
   ├── api.ts              # バックエンド API 呼び出し
   ├── auth.ts             # 認証状態やトークン処理
   ├── storage.ts          # Chrome storage への保存
   └── web-auth-bridge.ts  # Web → 拡張の認証ブリッジ
```

## api

Go + Gin API サーバー

```sh
api/
 ├── go.mod
 ├── go.sum
 ├── cmd/
 │  └── server/
 │     └── main.go               # エントリポイント
 ├── ent/
 │  └── schema/                  # スキーマ定義
 │     └── link.go
 └── internal/
     ├── config/
     │   └── config.go           # 環境変数読み込み
     ├── db/
     │   └── ent.go              # PostgreSQL + pgx + ent  接続 / ent クライアント作成
     ├── handler/                # Gin のハンドラ群
     │   └── links.go
     ├── middleware/
     │   └── auth.go             # Clerk JWT 認証
     ├── model/                  # リクエスト / モデル定義
     │   └── link.go
     ├── repository/             # 永続化（ ent ） と 検索条件/ソート の実装
     │   ├── mapper.go
     │   └── link_repository.go
     └── service/                # ビジネスロジック
         └── metadata.go         # OGP 取得処理
```

## web

```sh
├── app/                            # Next.js アプリ本体（サブドメイン: app.quicklinks-zeta.vercel.app）
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .env.local.example
│   └── src/
│       ├── app/
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx            # リンク一覧（フィルタ付き）
│       │   ├── u/
│       │   │   └── [username]/links/page.tsx # 公開共有ページ `/u/<username>/links`
│       │   ├── digests/
│       │   │   ├── page.tsx        # 自分のダイジェスト一覧
│       │   │   └── [slug].tsx      # 公開ダイジェスト表示
│       │   ├── settings/
│       │   │   └── page.tsx
│       │   ├── sign-in/
│       │   └── sign-up/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx
│       │   │   ├── Header.tsx
│       │   │   └── Sidebar.tsx
│       │   ├── links/
│       │   │   ├── LinkList.tsx
│       │   │   ├── LinkItem.tsx
│       │   │   └── LinkFilterBar.tsx
│       │   ├── digests/
│       │   │   └── DigestCard.tsx
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Spinner.tsx
│       │       └── Badge.tsx
│       └── lib/
│           ├── apiClient.ts        # API 呼び出しラッパ
│           └── supabaseClient.ts   # Supabase クライアント（read 用）
```

```sh
├── web/                            # Next.js アプリ
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .env.local.example
│   └── src/
│       ├── app/
│       │   ├── favicon.ico
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx            # LP（ヒーロー/価値訴求＋CTA）。サブドメイン: quicklinks-zeta.vercel.app（公開領域）
│       │   ├── community/          # 公開コミュニティ一覧（全体公開リンクの最近分）※後続マイルストーン
│       │   │   └── page.tsx
│       │   └── docs/               # （任意）公開ドキュメント系
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx
│       │   │   ├── Header.tsx
│       │   │   └── Sidebar.tsx
│       │   ├── links/
│       │   │   ├── LinkList.tsx
│       │   │   ├── LinkItem.tsx
│       │   │   └── LinkFilterBar.tsx
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Spinner.tsx
│       │       └── Badge.tsx
│       └── lib/
│           ├── apiClient.ts        # API 呼び出しラッパ
│           └── supabaseClient.ts   # Supabase クライアント（read 用）
```
