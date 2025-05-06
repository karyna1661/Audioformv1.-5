-- Create analytics_events table to track all user events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  survey_id UUID REFERENCES surveys(id),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create analytics_funnels table to define conversion funnels
CREATE TABLE analytics_funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_conversions table to track funnel conversions
CREATE TABLE analytics_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID REFERENCES analytics_funnels(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id TEXT NOT NULL,
  current_step TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  properties JSONB DEFAULT '{}'
);

-- Create analytics_metrics table for aggregated metrics
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimension TEXT,
  dimension_value TEXT,
  time_period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_survey_id ON analytics_events(survey_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_conversions_funnel_id ON analytics_conversions(funnel_id);
CREATE INDEX idx_analytics_conversions_session_id ON analytics_conversions(session_id);
CREATE INDEX idx_analytics_metrics_metric_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_metrics_time_period ON analytics_metrics(time_period, start_date, end_date);

-- Insert the demo conversion funnel
INSERT INTO analytics_funnels (name, description, steps)
VALUES (
  'Demo to Waitlist Conversion',
  'Tracks user journey from demo creation to waitlist signup',
  '[
    {"name": "demo_created", "description": "User created a demo survey"},
    {"name": "demo_viewed", "description": "User viewed their demo dashboard"},
    {"name": "demo_shared", "description": "User shared their demo survey"},
    {"name": "responses_received", "description": "Demo received at least one response"},
    {"name": "expiry_notification_shown", "description": "User was shown the expiry notification"},
    {"name": "waitlist_modal_opened", "description": "User opened the waitlist signup modal"},
    {"name": "waitlist_joined", "description": "User joined the waitlist"}
  ]'
);
