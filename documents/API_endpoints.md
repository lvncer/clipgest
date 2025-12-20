# API エンドポイント一覧（api/ 実装準拠）

## ルーティング定義の場所

- **Gin ルータ起動/ミドルウェア登録**: [`api/cmd/server/main.go`](../api/cmd/server/main.go)
- **`/api/*` のルート登録**: [`api/internal/handler/links.go`](../api/internal/handler/links.go)

## 認証（Clerk JWT）

- **対象**: `/api/*` は全て Clerk JWT 必須（`/health` は例外）
- **ヘッダ**: `Authorization: Bearer <Clerk JWT>`
- **検証**: Clerk SDK の `jwt.Verify()` を使用し、`claims.Subject`（JWT の `sub`）を `user_id` として Gin context に格納
- **実装**: [`api/internal/middleware/auth.go`](../api/internal/middleware/auth.go)

## エンドポイント

### `GET /health`

- **概要**: ヘルスチェック（認証なし）
- **実装**: [`api/cmd/server/main.go`](../api/cmd/server/main.go)
- **レスポンス**: `200 {"status":"ok"}`

### `POST /api/links`

- **概要**: リンクを保存する（拡張機能からの保存想定）
- **認証**: 必須（`user_id` は JWT の `sub` から取得。リクエストボディに `user_id` は不要/未使用）
- **実装**:
  - ルート登録: [`api/internal/handler/links.go`](../api/internal/handler/links.go)
  - ハンドラ: `CreateLink`（同ファイル）
  - リクエスト型: [`api/internal/model/link.go`](../api/internal/model/link.go)
  - 保存処理（DB）: [`api/internal/repository/link_repository.go`](../api/internal/repository/link_repository.go)
  - OGP 取得: [`api/internal/service/metadata.go`](../api/internal/service/metadata.go)
- **リクエストボディ（JSON）**:
  - **必須**: `url`（string）, `title`（string）, `page`（string）
  - **任意**: `note`（string）, `tags`（string[]）
- **挙動メモ**:
  - `url` から `domain` を抽出（`www.` は除去）
  - OGP を同期取得して `description` / `og_image` を保存（取得失敗時は空のまま保存されることあり）
- **レスポンス**: `200 {"id":"<uuid>"}`

### `GET /api/links`

- **概要**: 認証済みユーザーのリンク一覧を返す（Web アプリ向け）
- **認証**: 必須（JWT の `sub` のみ返却対象）
- **実装**:
  - ルート登録: [`api/internal/handler/links.go`](../api/internal/handler/links.go)
  - ハンドラ: `GetLinks`（同ファイル）
  - 検索/ソート: [`api/internal/repository/link_repository.go`](../api/internal/repository/link_repository.go)
- **クエリパラメータ**:
  - **limit**: 1〜100（不正値は 50 にフォールバック。省略時 50）
  - **from**: `YYYY-MM-DD`（開始日・inclusive）
  - **to**: `YYYY-MM-DD`（終了日・inclusive 相当になるよう内部で +1 日して exclusive 扱い）
  - **tz**: IANA タイムゾーン（例 `Asia/Tokyo`。省略時 `UTC`）
  - **domain**: ドメイン完全一致（`www.` は除去して比較）
  - **tag**: 複数指定可（例 `?tag=a&tag=b`）。空要素は除外、重複は除去。**OR 条件（いずれかのタグを含む）**
- **ソート順（実装準拠）**:
  - `ORDER BY saved_at DESC, id DESC`
- **レスポンス**: `200 {"links":[...]}`

### `GET /api/og`

- **概要**: 指定 URL の OGP を取得する
- **認証**: 必須（※ハンドラ内では `user_id` を参照しないが、`/api/*` グループなので JWT は必須）
- **実装**:
  - ルート登録: [`api/internal/handler/links.go`](../api/internal/handler/links.go)
  - ハンドラ: `GetOGP`（同ファイル）
  - 取得処理: [`api/internal/service/metadata.go`](../api/internal/service/metadata.go)
- **クエリパラメータ**:
  - **url**: 必須（string）
- **レスポンス**:
  - `200 { "title": string, "description": string, "image": string }`
