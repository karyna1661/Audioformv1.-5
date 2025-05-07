-- Policy for anonymous users to create demo surveys
CREATE POLICY "Anyone can create demo surveys"
ON surveys
FOR INSERT
TO anon
WITH CHECK (type = 'demo');

-- Policy for anonymous users to create demo sessions
CREATE POLICY "Anyone can create demo sessions"
ON demo_sessions
FOR INSERT
TO anon
WITH CHECK (true);
