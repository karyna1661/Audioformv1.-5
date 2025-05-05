-- First, enable Row Level Security on the surveys table
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- 1. Policy for authenticated users to create their own surveys
CREATE POLICY "Users can create their own surveys"
ON surveys
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Policy for authenticated users to read their own surveys
CREATE POLICY "Users can view their own surveys"
ON surveys
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Policy for authenticated users to update their own surveys
CREATE POLICY "Users can update their own surveys"
ON surveys
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Policy for authenticated users to delete their own surveys
CREATE POLICY "Users can delete their own surveys"
ON surveys
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Policy for anonymous users to read demo surveys
CREATE POLICY "Anyone can view demo surveys"
ON surveys
FOR SELECT
TO anon
USING (type = 'demo');

-- 6. Policy for service role to manage demo surveys
-- Note: This is handled by the service role key bypassing RLS

-- 7. Policy for authenticated users to also read demo surveys
-- (in case they want to see demo surveys while logged in)
CREATE POLICY "Authenticated users can view demo surveys"
ON surveys
FOR SELECT
TO authenticated
USING (type = 'demo');
