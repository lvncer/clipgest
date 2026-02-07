# Docker 関連

## API 用 Docker イメージ

- 定義ファイル: `api/Dockerfile`
- 概要:
  - Go 公式イメージ + マルチステージビルド
  - ビルドステージで `api/go.mod` / `api/go.sum` を使って依存解決
  - `CGO_ENABLED=0`, `GOOS=linux`, `GOARCH=amd64` で静的バイナリ `server` をビルド
  - ランタイムステージ（`alpine:3.20`）にバイナリだけコピーして軽量コンテナとして起動
- 公開ポート: `8080`

## Web 用 Docker イメージ

- 定義ファイル: `web/Dockerfile`
- 概要:
  - `node:20-alpine` ベースのマルチステージ構成
  - ビルドステージ:
    - `web/package.json` をコピーして `npm install --omit=dev`
    - `web/` 一式をコピーして `npm run build`
  - ランタイムステージ:
    - `/app` にビルド済み成果物と `node_modules` をコピー
    - `npm run start` で Next.js を起動
- 公開ポート: `3000`

※ 本番向けのイメージビルド手順やレジストリ連携は、デプロイ先のインフラに合わせて別途整備する。

## docker compose で API + Web を同時起動

ローカルで API (`api`) と Web (`web`) をコンテナとして同時に起動するための compose ファイルがあります。

- ファイル: `docker-compose.yml`
- 前提:
  - `api/.env` が存在し、少なくとも以下が設定されていること
    - `DATABASE_URL`
    - `CLERK_SECRET_KEY`
    - （必要に応じて `PORT`, `ENVIRONMENT`）
  - `web/.env.local` が存在し、Clerk のキーが設定されていること
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`

compose では、Web から API へはコンテナ名で通信します:

- API サービス名: `api`
- Web サービス名: `web`
- Web コンテナ内の `API_BASE_URL` / `NEXT_PUBLIC_API_BASE` は `http://api:8080` に上書きされます
