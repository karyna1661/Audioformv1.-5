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

-- Policy for anonymous users to track analytics events
CREATE POLICY "Anyone can track analytics events"
ON analytics_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy for anonymous users to create analytics conversions
CREATE POLICY "Anyone can create analytics conversions"
ON analytics_conversions
FOR INSERT
TO anon
WITH CHECK (true);
