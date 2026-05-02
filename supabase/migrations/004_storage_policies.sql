-- ============================================================
-- MIGRASI 004: Storage RLS Policies untuk invitation_assets
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation_assets', 'invitation_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access for invitation_assets" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'invitation_assets' );

CREATE POLICY "Authenticated users can upload invitation_assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'invitation_assets' );

CREATE POLICY "Users can delete their own invitation_assets"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'invitation_assets' AND auth.uid() = owner );

CREATE POLICY "Users can update their own invitation_assets"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'invitation_assets' AND auth.uid() = owner );
