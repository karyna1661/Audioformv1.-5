-- First, make sure RLS is enabled
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anon/demo survey creation" ON public.surveys;
DROP POLICY IF EXISTS "Allow auth users insert own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Anyone can view demo surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can view own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Anyone can create demo surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can create their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can view their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can delete their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Authenticated users can view demo surveys" ON public.surveys;

-- Now create clean policies

-- 1. Anonymous users can create demo surveys
CREATE POLICY "Anyone can create demo surveys"
ON public.surveys
FOR INSERT
TO anon
WITH CHECK (
  type = 'demo'
);

-- 2. Anonymous users can view demo surveys
CREATE POLICY "Anyone can view demo surveys"
ON public.surveys
FOR SELECT
TO anon
USING (
  type = 'demo'
);

-- 3. Authenticated users can create their own surveys
CREATE POLICY "Users can create their own surveys"
ON public.surveys
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR type = 'demo'
);

-- 4. Authenticated users can view their own surveys
CREATE POLICY "Users can view their own surveys"
ON public.surveys
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR type = 'demo'
);

-- 5. Authenticated users can update their own surveys
CREATE POLICY "Users can update their own surveys"
ON public.surveys
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

-- 6. Authenticated users can delete their own surveys
CREATE POLICY "Users can delete their own surveys"
ON public.surveys
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);
