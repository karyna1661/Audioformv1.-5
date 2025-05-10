-- First, make sure RLS is enabled
ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create demo sessions" ON public.demo_sessions;
DROP POLICY IF EXISTS "Anyone can view demo sessions" ON public.demo_sessions;

-- Now create clean policies

-- 1. Anonymous users can create demo sessions
CREATE POLICY "Anyone can create demo sessions"
ON public.demo_sessions
FOR INSERT
TO anon
WITH CHECK (true);

-- 2. Anonymous users can view demo sessions
CREATE POLICY "Anyone can view demo sessions"
ON public.demo_sessions
FOR SELECT
TO anon
USING (true);

-- 3. Anonymous users can update demo sessions
CREATE POLICY "Anyone can update demo sessions"
ON public.demo_sessions
FOR UPDATE
TO anon
USING (true);
