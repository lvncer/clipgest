#!/bin/bash

# Go コードを一括フォーマットするシンプルなスクリプト
set -e

cd "$(dirname "$0")/../api"

echo "Running go fmt ./..."
go fmt ./...
