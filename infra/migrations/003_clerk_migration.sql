-- M3.1: Clerk 認証移行用マイグレーション
-- user_identifier を user_id に rename し、Clerk の user_id を使用する

-- links テーブルのカラム名を変更
ALTER TABLE links RENAME COLUMN user_identifier TO user_id;

-- digests テーブルのカラム名を変更
ALTER TABLE digests RENAME COLUMN user_identifier TO user_id;

-- インデックスを再作成（新しいカラム名に対応）
DROP INDEX IF EXISTS idx_links_user_saved_at;
CREATE INDEX idx_links_user_saved_at ON links (user_id, saved_at DESC);

DROP INDEX IF EXISTS idx_digests_user_period;
CREATE INDEX idx_digests_user_period ON digests (user_id, period_start DESC);
