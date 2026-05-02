-- ============================================================
-- MIGRASI 003: Puck Builder Schema Extension
-- Menambahkan kolom puck_data ke user_invitations untuk
-- menyimpan state visual builder (Puck.js)
-- ============================================================

-- 1. Tambahkan kolom puck_data (JSONB) untuk menyimpan state Puck editor
--    Kolom ini NULLABLE karena undangan yang dibuat dengan template lama
--    tidak menggunakan Puck builder.
ALTER TABLE user_invitations
  ADD COLUMN IF NOT EXISTS puck_data JSONB DEFAULT NULL;

-- 2. Tambahkan kolom builder_mode agar sistem tahu
--    apakah undangan ini menggunakan template lama atau Puck builder
--    'template' = arsitektur BaseTemplate (default, backward compat)
--    'puck'     = arsitektur Puck visual builder
ALTER TABLE user_invitations
  ADD COLUMN IF NOT EXISTS builder_mode TEXT NOT NULL DEFAULT 'template'
  CHECK (builder_mode IN ('template', 'puck'));

-- 3. Index untuk query builder_mode (useful saat filter di dashboard)
CREATE INDEX IF NOT EXISTS idx_user_invitations_builder_mode
  ON user_invitations(builder_mode);

-- 4. Comment untuk dokumentasi
COMMENT ON COLUMN user_invitations.puck_data IS
  'JSON state lengkap dari Puck editor (@measured/puck Data type). NULL jika menggunakan mode template.';
COMMENT ON COLUMN user_invitations.builder_mode IS
  'Mode builder: template (BaseTemplate sections) atau puck (visual drag-and-drop).';
