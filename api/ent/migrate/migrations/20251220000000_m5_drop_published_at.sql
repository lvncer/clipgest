-- Drop `published_at` from links.
--
-- This project fully removes the published-date concept:
-- - DB: drop column and index
-- - API: stop persisting/returning it
-- - Web: stop showing it

DROP INDEX IF EXISTS "idx_links_published_at";
ALTER TABLE "links" DROP COLUMN "published_at";
