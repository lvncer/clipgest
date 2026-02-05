# 将来的なファイルツリー（完成系イメージ）

最終的に目指すモノレポ構成のイメージ。
実際の実装時には細かいファイル名は変わる可能性があるが、レイヤー構造と責務の単位感を示す。

```sh
/
├── README.md
├── package.json               # ルート共通ツール
├── bun.lock                   # ルート bun 用ロックファイル
├── biome.json                 # Biome 設定
├── docker-compose.yml         # API + Web を同時起動する docker compose 設定
├── .dockerignore              # Docker ビルド用の ignore 設定
├── .gitignore
│
├── .husky/
│  └── pre-commit/             # lint-staged を呼ぶフック
│
├── public/
│  └── images/
│
├── documents/
│
│
├── extension/
│  ├── package.json            # 依存関係/ビルド・監視コマンド
│  ├── bun.lock                # 依存のロックファイル
│  ├── tsconfig.json           # TypeScript 設定
│  ├── vite.config.ts          # src 直下 TS を全エントリにする Vite 設定
│  ├── manifest.json           # 本番用マニフェスト
│  ├── icons/                  # 拡張アイコン
│  ├── dist/                   # ビルド成果物 （vite build で生成）
│  └── src/
│    ├── background.ts         # 背景処理 （保存/認証/メッセージ）
│    ├── content-script.ts     # 画面側の通知受信と alert 表示
│    ├── api.ts                # バックエンド API 呼び出し
│    ├── auth.ts               # 認証状態やトークン処理
│    ├── storage.ts            # Chrome storage への保存
│    └── web-auth-bridge.ts    # Web → 拡張の認証ブリッジ
│
│
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
│
├── api/                            # Go + Gin API サーバー
│   ├── go.mod
│   ├── go.sum
│   ├── .env.example
│   ├── cmd/
│   │   └── server/
│   │       └── main.go             # エントリポイント
│   └── internal/
│       ├── config/
│       │   └── config.go           # env 読み込み
│       ├── db/
│       │   ├── pg.go               # pgx 接続プール
│       │   └── migrate.go          # （任意）マイグレーション実行ヘルパ
│       ├── model/
│       │   ├── link.go             # Link / LinkCreateRequest
│       │   ├── digest.go           # Digest / DigestItem
│       │   ├── user.go
│       │   ├── tag.go
│       │   └── job.go
│       ├── handler/
│       │   ├── links.go            # POST /api/links, GET /api/links
│       │   ├── digests.go          # ダイジェスト用 API（最終版では週次・月次の自動生成も含む）
│       │   └── health.go           # /health
│       ├── service/
│       │   ├── link_service.go     # ビジネスロジック（リンク登録など）
│       │   └── digest_service.go   # ダイジェスト生成ロジック（AI 呼び出し含む）
│       ├── worker/
│       │   ├── queue.go            # ジョブキュー管理（Redis 等）
│       │   └── jobs/
│       │       ├── fetch_og.go     # OG/メタデータ取得ジョブ
│       │       └── summarize_week.go # 週次ダイジェスト生成ジョブ
│       └── util/
│           ├── logger.go
│           └── http_error.go
│
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
│
├── dev-scripts/
│   ├── run-all.sh                  # API + Web を同時に起動するスクリプト
│   ├── stop-all.sh                 # API + Web をまとめて停止するスクリプト
│   ├── test-api.sh                 # API の疎通テスト用スクリプト
│   ├── format-go.sh                # go fmt ./... を手動実行するスクリプト
│   └── build-all.sh                # API / Web / Extension のクリーン & ビルド用スクリプト
│
└── .github/
    ├── dependabot.yml              # 依存アップデート設定
    └── workflows/
        ├── ci.yml                  # matrix で web / extension / api の lint / build / test を実行
        └── dependabot-automerge.yml # Dependabot PR の自動マージ用ワークフロー
```
