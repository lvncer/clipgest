# ローカル開発

## 1. 環境変数の設定

1. `api/.env` を作成（`.env.example` を参考）

   | 環境変数         | 例                                     | 備考                      |
   | ---------------- | -------------------------------------- | ------------------------- |
   | DATABASE_URL     | `postgresql://:@.supabase.co:5432/...` | 必ず sesson pooler を選択 |
   | CLERK_SECRET_KEY | `sk_test_...`                          |                           |

2. `web/.env.local` を作成（`.env.local.example` を参考）

   | 環境変数                          | 例            |
   | --------------------------------- | ------------- |
   | NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | `pk_test_...` |
   | CLERK_SECRET_KEY                  | `sk_test_...` |

## 2. サーバの起動

以下の方法から選択してください。

- [Docker Compose での起動（推奨）](#起動方法)
- [手動での起動](#手動での起動)

---

### 起動方法

```bash
docker compose up --build
```

- 初回は `--build` を付けてイメージをビルド
- 2 回目以降は `docker compose up` だけでも OK

停止する場合:

```bash
docker compose down
```

---

### 手動での起動

#### 前提条件

- Go 1.25+
- Node.js + Bun

#### API サーバー（Go + Gin）

ローカルで実行:

```bash
cd api
go run ./cmd/server
```

#### Web アプリ（Next.js）

ローカルで実行:

```bash
cd web
bun run dev
```
