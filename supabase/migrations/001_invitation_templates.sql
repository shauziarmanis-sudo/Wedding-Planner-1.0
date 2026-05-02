-- Tabel master template (diisi oleh seed data)
CREATE TABLE invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region_tags TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  preview_thumbnail_url TEXT,
  component_path TEXT NOT NULL,
  default_config JSONB NOT NULL DEFAULT '{}',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel undangan milik user (satu user bisa punya satu undangan aktif)
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES invitation_templates(template_id),
  public_slug TEXT UNIQUE NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  music_url TEXT,
  music_autoplay BOOLEAN DEFAULT false,
  photos JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Index untuk lookup cepat
CREATE INDEX idx_user_invitations_slug ON user_invitations(public_slug);
CREATE INDEX idx_user_invitations_user ON user_invitations(user_id);

-- RLS Policies
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Templates: siapapun bisa baca
CREATE POLICY "Anyone can read templates" ON invitation_templates FOR SELECT USING (true);

-- User invitations: user hanya bisa akses milik sendiri
CREATE POLICY "User owns their invitation" ON user_invitations
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public invitation: bisa dibaca tanpa auth jika is_published = true
CREATE POLICY "Public can read published invitations" ON user_invitations
  FOR SELECT USING (is_published = true);
