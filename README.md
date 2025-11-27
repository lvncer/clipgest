# Quicklinks

気になった Web ページの URL をブラウザ拡張から一瞬で保存して、あとから Web ダッシュボードで見返したり、将来は週次・月次ダイジェストにまとめられるようにするアプリ。

## 構成

- **API サーバー**: Go + Gin (`api/`)
- **Web アプリ**: Next.js (`web/`)
- **インフラ / DB スキーマ**: Supabase / Postgres (`infra/`)
- **ブラウザ拡張**: Chrome Extension MV3 (`extension/`)

## ドキュメント

- 詳しいアーキテクチャは [`documents/architecture.md`](documents/architecture.md) を参照。
- マイルストーン・実装順序は [`documents/milestones.md`](documents/milestones.md) を参照。

## ローカル開発

### 前提

- Go 1.25+
- Docker
- Supabase プロジェクト（DB 接続用）

### API サーバー（Go + Gin）

1. `api/.env` を作成（`.env.example` を参考）:

   ```bash
   DATABASE_URL=postgres://user:password@host:5432/dbname
   SHARED_SECRET=your-secret-here
   PORT=8080
   ```

2. ローカルで実行:

   ```bash
   cd api
   go run ./cmd/server
   ```

3. または Docker で実行:

   **方法 1: シェルスクリプトを使う（推奨）**

   ```bash
   ./dev-scripts/run-api-docker.sh
   ```

   このスクリプトは `api/.env` を自動で読み込んでくれます。

   **方法 2: docker run を直接使う**

   ```bash
   docker build -t quicklinks-api -f api/Dockerfile .
   docker run --rm \
     --env-file api/.env \
     -p 8080:8080 \
     quicklinks-api
   ```

### API エンドポイント

- `POST /api/links` … リンクを保存（`X-QuickLink-Secret` ヘッダ必須）

### API テスト

**方法 1**: テストスクリプトを使う（推奨）

```bash
./dev-scripts/test-api.sh
```

このスクリプトは `api/.env` から `SHARED_SECRET` を自動で読み込んでくれます。

**方法 2**: curl を直接使う

```bash
# api/.env の SHARED_SECRET の値を確認して、以下を実行
curl -X POST http://localhost:8080/api/links \
  -H "Content-Type: application/json" \
  -H "X-QuickLink-Secret: <api/.env の SHARED_SECRET の値>" \
  -d '{
    "url": "https://example.com/article",
    "title": "Example Article",
    "page": "https://example.com",
    "note": "test from curl",
    "user_identifier": "dev-user"
  }'
```

**注意**: `X-QuickLink-Secret` の値は `api/.env` の `SHARED_SECRET` と一致させる必要があります。

### Web アプリ（Next.js）

（未実装、M3 以降で追加予定）

### ブラウザ拡張

（未実装、M2 以降で追加予定）

## ライセンス

（未定）
