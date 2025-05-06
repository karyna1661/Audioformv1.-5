CREATE OR REPLACE FUNCTION get_funnel_conversion_rates(funnel_name TEXT, time_period_days INTEGER)
RETURNS TABLE (
  step_name TEXT,
  count BIGINT,
  conversion_rate NUMERIC
) AS $$
DECLARE
  funnel_id UUID;
  funnel_steps JSONB;
  total_count BIGINT;
BEGIN
  -- Get the funnel ID and steps
  SELECT id, steps INTO funnel_id, funnel_steps
  FROM analytics_funnels
  WHERE name = funnel_name
  LIMIT 1;
  
  -- Calculate the date range
  WITH date_range AS (
    SELECT 
      NOW() - (time_period_days || ' days')::INTERVAL AS start_date,
      NOW() AS end_date
  ),
  
  -- Get counts for each step
  step_counts AS (
    SELECT 
      ac.current_step,
      COUNT(DISTINCT ac.session_id) AS step_count
    FROM analytics_conversions ac
    CROSS JOIN date_range dr
    WHERE ac.funnel_id = funnel_id
    AND ac.started_at >= dr.start_date
    AND ac.started_at <= dr.end_date
    GROUP BY ac.current_step
  )
  
  -- Get the first step count for calculating conversion rates
  SELECT step_count INTO total_count
  FROM step_counts
  WHERE current_step = (funnel_steps->0->>'name')
  LIMIT 1;
  
  -- If no data, set total_count to 1 to avoid division by zero
  IF total_count IS NULL OR total_count = 0 THEN
    total_count := 1;
  END IF;
  
  -- Return the results
  RETURN QUERY
  SELECT 
    s->>'name' AS step_name,
    COALESCE(sc.step_count, 0) AS count,
    CASE 
      WHEN total_count > 0 THEN 
        ROUND((COALESCE(sc.step_count, 0)::NUMERIC / total_count) * 100, 2)
      ELSE 0
    END AS conversion_rate
  FROM jsonb_array_elements(funnel_steps) s
  LEFT JOIN step_counts sc ON sc.current_step = s->>'name'
  ORDER BY array_position(ARRAY(SELECT jsonb_array_elements(funnel_steps)->>'name'), s->>'name');
END;
$$ LANGUAGE plpgsql;
