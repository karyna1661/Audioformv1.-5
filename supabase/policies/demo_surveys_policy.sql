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

-- Policy for anonymous users to read demo surveys
CREATE POLICY "Anyone can view demo surveys"
ON surveys
FOR SELECT
TO anon
USING (type = 'demo');

-- Policy for anonymous users to read demo sessions
CREATE POLICY "Anyone can view demo sessions"
ON demo_sessions
FOR SELECT
TO anon
USING (true);
