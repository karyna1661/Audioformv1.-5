-- Create survey_submissions table for multi-survey support
CREATE TABLE IF NOT EXISTS survey_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_email TEXT,
    responses JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_submissions_survey_id ON survey_submissions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_submissions_completed_at ON survey_submissions(completed_at);
CREATE INDEX IF NOT EXISTS idx_survey_submissions_user_email ON survey_submissions(user_email);

-- Add RLS policies
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their own submissions
CREATE POLICY "Allow anonymous submissions" ON survey_submissions
    FOR INSERT 
    WITH CHECK (true);

-- Allow users to view submissions for active surveys
CREATE POLICY "Allow viewing submissions for active surveys" ON survey_submissions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = survey_submissions.survey_id 
            AND surveys.is_active = true
        )
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_survey_submissions_updated_at 
    BEFORE UPDATE ON survey_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
