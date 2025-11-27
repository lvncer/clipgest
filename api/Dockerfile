# ビルドステージ
FROM golang:1.25-alpine AS builder

WORKDIR /app

# 依存だけ先にコピー
COPY api/go.mod api/go.sum ./
RUN go mod download

# 残りのソース
COPY api/ .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/server ./cmd/server

# 実行ステージ
FROM alpine:3.20

WORKDIR /app

ENV PORT=8080

COPY --from=builder /app/server /app/server

EXPOSE 8080

CMD ["/app/server"]
