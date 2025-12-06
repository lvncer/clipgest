#!/bin/bash

# Go コードを一括フォーマットするスクリプト
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_DIR="$PROJECT_ROOT/api"

cd "$API_DIR"

echo "Running go fmt ./..."
go fmt ./...
