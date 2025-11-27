#!/bin/bash

# quicklinks API サーバーを Docker で起動するスクリプト

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$PROJECT_ROOT/api"
ENV_FILE="$API_DIR/.env"

# .env ファイルの存在確認
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE が見つかりません"
  echo "api/.env.example をコピーして api/.env を作成し、必要な環境変数を設定してください"
  exit 1
fi

# Docker イメージが存在するか確認、なければビルド
if ! docker image inspect quicklinks-api:latest >/dev/null 2>&1; then
  echo "Docker イメージが見つかりません。ビルドを開始します..."
  docker build -t quicklinks-api -f "$API_DIR/Dockerfile" "$PROJECT_ROOT"
fi

# コンテナを起動
echo "API サーバーを起動しています..."
docker run --rm \
  --env-file "$ENV_FILE" \
  -p 8080:8080 \
  quicklinks-api

