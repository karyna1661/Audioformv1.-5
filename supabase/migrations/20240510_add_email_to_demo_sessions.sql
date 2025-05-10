-- Add email column to demo_sessions table
ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS email TEXT;

-- Update RLS policies to allow access to the new column
ALTER POLICY "Anyone can create demo sessions" ON demo_sessions USING (true);
