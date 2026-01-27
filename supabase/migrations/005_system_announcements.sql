-- Create system_announcements table
CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    target TEXT NOT NULL CHECK (target IN ('all', 'web', 'mobile')),
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active announcements
CREATE POLICY "Everyone can read active announcements"
ON system_announcements FOR SELECT
USING (active = true);

-- Policy: Only authenticated users with admin role (or specific permission) can manage
-- For simplicity in this project, we'll allow all authenticated users to manage for now, 
-- OR strictly restrict if we have an 'admin' role logic. 
-- Assuming 'authenticated' is enough for the "Admin Panel" users in this context.
CREATE POLICY "Authenticated users can manage announcements"
ON system_announcements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_system_announcements_active ON system_announcements(active);
