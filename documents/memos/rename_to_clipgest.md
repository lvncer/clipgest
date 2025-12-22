# clipgest へのリネーム & フロントドメインを clipgest.com に変更するときの作業まとめ

目的は 2 つです。

- **プロダクト名の統一**: `QuickLinks` → **clipgest**
- **フロントの正規ドメイン変更**: `quicklinks-*.vercel.app` 等 → **`https://clipgest.com`**

このリポジトリは **Web(Next.js)** / **API(Go/Gin)** / **Chrome 拡張** が連携していて、特に **認証(Clerk)** と **CORS** と **拡張の host/matches** がドメインに強く依存します。

## 追加で確認したいこと（聞きたいことある？への回答）

「Cloudflare のドメインを Vercel に載せる方法」は OK とのことなので、それ以外で確認したいのはこれだけ！

- **(A) 旧ドメインは残す？即切り替え？**
  - 旧 `*.vercel.app` から `clipgest.com` へ 301/移行期間を設けるかで、Clerk の設定や CORS の許可を一時的に“複数”にするかが変わる
- **(B) `www.clipgest.com` も使う？**
  - 使うなら Clerk / CORS / manifest の `matches` を `www` も含めて二重登録が必要
- **(C) Web は「ルート 1 つ」運用？ LP とアプリでサブドメイン分離する？**
  - いまは `web/` 1 つに見えるけど、ドキュメントには `app.` サブドメイン案もあるので、採用するならさらにドメインが増える（Clerk/CORS/拡張も増える）
- **(D) API の公開ドメイン/エンドポイントは変える？**
  - 今回は「フロント」だけの予定でも、拡張や Web の設定画面に API URL が固定/デフォルトで入っているので、将来変えるなら併せて整理したい

## 今回の方針（A〜D の決定事項）

- **A. 旧ドメインは当面残す（リダイレクト運用）**
  - 初期は導入しやすさ優先で、旧 `*.vercel.app` から **`clipgest.com`（or `www.clipgest.com`）へリダイレクト**
  - 余裕が出たタイミングで完全移行（旧ドメインの許可を段階的に外す）
- **B. `www` も運用する**
  - LP の SEO を考えて `www.clipgest.com` を使う前提
  - そのため、Clerk/CORS/拡張 `matches` は **`clipgest.com` と `www.clipgest.com` の両方**を登録する
- **C. `app.` サブドメイン分離は将来**
  - 今はやらないが、将来的に `app.clipgest.com` を増やすときは Clerk/CORS/拡張 `matches` の追加が必要
- **D. API のドメインは固定（変えない）**
  - API 側の変更は「CORS 許可オリジン追加」が中心

## 最重要: Clerk を Development → Production にする（絶対忘れない）

**これを忘れると “本番で動いてるのに認証が変/止まる” 系の事故が起きやすいです。**

- [ ] **Clerk Dashboard で instance を Production 化（Development モードのまま出さない）**
- [ ] **Production 用のキーに差し替え**
  - Web: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - API: `CLERK_SECRET_KEY`
- [ ] **Production 側で Allowed Origins / Redirect URLs を登録**
  - `https://clipgest.com`
  - `https://www.clipgest.com`
- [ ] （もし該当するなら）OAuth callback URLs も Production 側で更新

※ リダイレクト移行期間を作るなら、Production 側に旧ドメインも一時的に併記して OK（外すのを忘れない）。

## 変更が必要になる可能性が高いところ（必須級）

### 1) Web(Next.js) 側の「表示名・SEO・リンク」更新

- **サイトタイトル/説明**
  - `web/src/app/layout.tsx` の `metadata.title` / `description`
  - `web/src/app/about/page.tsx` の `metadata`（OpenGraph も）
- **Web の環境変数（拡張同期/API 呼び出しで使用）**
  - `NEXT_PUBLIC_API_BASE`: ブラウザから叩く API Base（拡張にも共有される）
  - `NEXT_PUBLIC_WEB_ORIGIN`: `window.postMessage` の `targetOrigin` に使う（設定している場合は **clipgest.com に更新必須**）
- **LP 内の固定文言/alt**
  - `web/src/app/about/page.tsx` に `QuickLinks` 表記、画像 `alt` などがある
- **外部リンク**
  - GitHub リポジトリ URL（`lvncer/quicklinks`）へのリンクが残っている
  - Chrome Web Store のリンク文言が `quicklinks` になっている（拡張の名称/ストア情報と合わせる）

### 2) Clerk（認証）のドメイン登録（超重要）

フロントドメインが変わると、**ログイン・コールバック・許可オリジン**がズレて認証が止まりがちです。

- **Clerk Dashboard でやること**
  - **Allowed Origins**: `https://clipgest.com`, `https://www.clipgest.com`
  - **Redirect URLs** / **Sign-in/Sign-up URLs**: 新ドメインへ
  - **(OAuth を使っているなら) OAuth callback URLs**: 新ドメインへ
  - （開発/ステージングがあるなら）旧ドメインも当面は併記して移行期間を作る

※ ドキュメントにも「両ドメイン追加」が明記されています（`documents/milestones.md`）。

### 3) API(Go/Gin) の CORS 許可オリジン更新（必須）

API は本番で **ホワイトリスト CORS** です。

- **API の挙動**
  - `ENVIRONMENT=development` のときだけ `AllowAllOrigins=true`
  - 本番は `ALLOWED_ORIGINS` に入っている origin だけ許可（＋ `chrome-extension://` は常に許可）
  - 実装: `api/cmd/server/main.go` + `api/internal/config/config.go`
- **やること**
  - 本番環境変数 `ALLOWED_ORIGINS` に **`https://clipgest.com, https://www.clipgest.com`** を追加
  - 旧ドメインを残す期間があるなら、旧 `*.vercel.app` も一時的に併記（完全移行後に削除）

### 4) Chrome 拡張の Web 側「連携対象ドメイン」更新（必須）

拡張は Web に埋め込まれる `web-auth-bridge.js` を **特定ドメインでのみ**動かしています。

- **変更対象**
  - `extension/manifest.json` の `content_scripts[].matches`
    - 現状: `https://quicklinks-zeta.vercel.app/*` など固定
  - （開発用）`extension/manifest.dev.json` も同様
- **やること**
  - `https://clipgest.com/*` と `https://www.clipgest.com/*` を `matches` に追加
  - 旧ドメインでの導入導線を残すなら、旧 `*.vercel.app` も当面は併記（完全移行後に削除）
- **補足（ハマりどころ）**
  - この `matches` がズレると、Web から拡張にトークンを渡す仕組み（WebAuthBridge）が動かず、拡張が「未認証」扱いになりやすい
  - `dist/` はビルド成果物なので、manifest や `src/` を直したら **拡張を再ビルドして再配布/再読み込み**が必要

---

## “名前を clipgest に変える” に伴う追加変更（やると綺麗）

### 5) 拡張の表示名・説明・ストア情報

- `extension/manifest.json`
  - `name`: `QuickLinks` → `clipgest`
  - `description` も文言を合わせる
  - `action.default_title` も更新
- `extension/src/storage.ts`
  - 型名 `QuickLinksConfig` やデフォルト値など、内部名の整理（必須ではないが混乱防止）
- **Web↔ 拡張の“識別名”を変えるか決める（任意）**
  - Web 側は `source: "quicklinks-web"`、メッセージ type は `QUICKLINKS_EXTENSION_AUTH` など固定文字列を使っている
  - これらは今のままでも動くけど、リブランドで統一したいなら **Web/拡張の両方**を同時に変更する（片方だけ変えると同期が壊れる）
- **Clerk の JWT template 名（任意）**
  - Web は `getToken({ template: "quicklinks-extension" })` を使っている
  - template 名を `clipgest-extension` に変えたい場合は、Clerk 側のテンプレも含めて同時に切り替える必要あり（移行期間は旧/新どちらを使うか要設計）
- **Chrome Web Store**
  - 拡張の「表示名」や掲載内容、スクリーンショット/説明文もリブランド
  - 既存 ID のまま改名できるか、別拡張として新規にするかを決める（運用方針次第）

### 6) リポジトリ/ドキュメント/README の表記更新

以下は “動作” には直結しないけど、移行後に混乱しやすいところ。

- `README.md` の URL・名称（例: `quicklinks-zeta.vercel.app`）更新
- `documents/` 内の表記（milestone/構成図/セットアップ手順）
- GitHub リポジトリをリネームするなら、リンクも合わせて更新

## 最低限のチェックリスト（これだけやれば止まりにくい）

- [ ] Web の `metadata` と LP 表記を clipgest に更新
- [ ] **Clerk を Production モードにする（Development のまま出さない）**
- [ ] Clerk(Production): `https://clipgest.com` / `https://www.clipgest.com` を Allowed Origins / Redirect 等に追加
- [ ] API: `ALLOWED_ORIGINS` に `https://clipgest.com,https://www.clipgest.com` を追加（移行期間は旧ドメインも併記）
- [ ] 拡張: `manifest(.dev).json` の `matches` に `https://clipgest.com/*` と `https://www.clipgest.com/*` を追加（移行期間は旧ドメインも併記）
- [ ] README / documents の URL と名称を更新（運用の混乱防止）
