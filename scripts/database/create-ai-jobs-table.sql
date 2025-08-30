-- =========================================
-- AI PROCESSING JOBS TABLE
-- =========================================
-- Version: 1.0
-- Date: 2024-12-28
-- Description: Create table for tracking AI processing jobs with status and resume capability

-- =========================================
-- 1. CREATE AI PROCESSING JOBS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS public.ai_processing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Job identification
  job_type TEXT NOT NULL CHECK (job_type IN ('design_generation', 'style_analysis', 'space_enhancement', 'furniture_matching', 'color_extraction')),
  job_status TEXT NOT NULL DEFAULT 'pending' CHECK (job_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'paused')),
  
  -- Processing stages and progress
  current_stage TEXT,
  completed_stages TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_stages INTEGER DEFAULT 5,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Input data
  input_data JSONB NOT NULL DEFAULT '{}',
  processing_parameters JSONB DEFAULT '{}',
  
  -- Output data
  output_data JSONB DEFAULT '{}',
  result_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Error handling
  error_message TEXT,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timing information
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  processing_time_seconds INTEGER,
  
  -- Priority and resource allocation
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  allocated_resources JSONB DEFAULT '{}',
  
  -- Job metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =========================================

-- Primary query indexes
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON public.ai_processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_project_id ON public.ai_processing_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_processing_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_type ON public.ai_processing_jobs(job_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_status ON public.ai_processing_jobs(user_id, job_status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_project_status ON public.ai_processing_jobs(project_id, job_status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON public.ai_processing_jobs(created_at);

-- Performance index for active jobs
CREATE INDEX IF NOT EXISTS idx_ai_jobs_active ON public.ai_processing_jobs(job_status, priority, created_at) 
WHERE job_status IN ('pending', 'processing');

-- =========================================
-- 3. ROW LEVEL SECURITY POLICIES
-- =========================================

-- Enable RLS
ALTER TABLE public.ai_processing_jobs ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own jobs
CREATE POLICY "Users can view own AI jobs"
ON public.ai_processing_jobs FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create new jobs
CREATE POLICY "Users can create AI jobs"
ON public.ai_processing_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own jobs (for status updates)
CREATE POLICY "Users can update own AI jobs"
ON public.ai_processing_jobs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own jobs
CREATE POLICY "Users can delete own AI jobs"
ON public.ai_processing_jobs FOR DELETE
USING (auth.uid() = user_id);

-- =========================================
-- 4. TRIGGER FUNCTIONS FOR AUTOMATION
-- =========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Calculate processing time if job is completed
  IF NEW.job_status = 'completed' AND OLD.job_status != 'completed' THEN
    NEW.completed_at = NOW();
    IF NEW.started_at IS NOT NULL THEN
      NEW.processing_time_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
  END IF;
  
  -- Set started_at when job begins processing
  IF NEW.job_status = 'processing' AND OLD.job_status != 'processing' THEN
    NEW.started_at = NOW();
    
    -- Estimate completion time based on job type
    CASE NEW.job_type
      WHEN 'design_generation' THEN
        NEW.estimated_completion = NOW() + INTERVAL '2 minutes';
      WHEN 'style_analysis' THEN
        NEW.estimated_completion = NOW() + INTERVAL '30 seconds';
      WHEN 'space_enhancement' THEN
        NEW.estimated_completion = NOW() + INTERVAL '1 minute';
      WHEN 'furniture_matching' THEN
        NEW.estimated_completion = NOW() + INTERVAL '45 seconds';
      WHEN 'color_extraction' THEN
        NEW.estimated_completion = NOW() + INTERVAL '15 seconds';
      ELSE
        NEW.estimated_completion = NOW() + INTERVAL '1 minute';
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_ai_jobs_updated_at_trigger ON public.ai_processing_jobs;
CREATE TRIGGER update_ai_jobs_updated_at_trigger
  BEFORE UPDATE ON public.ai_processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_jobs_updated_at();

-- =========================================
-- 5. JOB MANAGEMENT FUNCTIONS
-- =========================================

-- Function to create a new AI processing job
CREATE OR REPLACE FUNCTION create_ai_processing_job(
  p_user_id UUID,
  p_project_id UUID,
  p_job_type TEXT,
  p_input_data JSONB DEFAULT '{}',
  p_processing_parameters JSONB DEFAULT '{}',
  p_priority INTEGER DEFAULT 5,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_job_id UUID;
BEGIN
  INSERT INTO public.ai_processing_jobs (
    user_id,
    project_id,
    job_type,
    input_data,
    processing_parameters,
    priority,
    metadata
  ) VALUES (
    p_user_id,
    p_project_id,
    p_job_type,
    p_input_data,
    p_processing_parameters,
    p_priority,
    p_metadata
  )
  RETURNING id INTO v_job_id;
  
  RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update job progress
CREATE OR REPLACE FUNCTION update_job_progress(
  p_job_id UUID,
  p_status TEXT DEFAULT NULL,
  p_current_stage TEXT DEFAULT NULL,
  p_progress_percentage INTEGER DEFAULT NULL,
  p_completed_stages TEXT[] DEFAULT NULL,
  p_output_data JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.ai_processing_jobs 
  SET 
    job_status = COALESCE(p_status, job_status),
    current_stage = COALESCE(p_current_stage, current_stage),
    progress_percentage = COALESCE(p_progress_percentage, progress_percentage),
    completed_stages = COALESCE(p_completed_stages, completed_stages),
    output_data = COALESCE(p_output_data, output_data),
    error_message = COALESCE(p_error_message, error_message)
  WHERE id = p_job_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active jobs for a user
CREATE OR REPLACE FUNCTION get_user_active_jobs(
  p_user_id UUID DEFAULT auth.uid()
) RETURNS TABLE (
  id UUID,
  job_type TEXT,
  job_status TEXT,
  current_stage TEXT,
  progress_percentage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aj.id,
    aj.job_type,
    aj.job_status,
    aj.current_stage,
    aj.progress_percentage,
    aj.created_at,
    aj.estimated_completion
  FROM public.ai_processing_jobs aj
  WHERE aj.user_id = p_user_id
    AND aj.job_status IN ('pending', 'processing', 'paused')
  ORDER BY aj.priority DESC, aj.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old completed jobs
CREATE OR REPLACE FUNCTION cleanup_completed_ai_jobs(
  p_days_old INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.ai_processing_jobs
  WHERE job_status IN ('completed', 'failed', 'cancelled')
    AND completed_at < NOW() - INTERVAL '1 day' * p_days_old;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 6. JOB QUEUE MANAGEMENT
-- =========================================

-- Function to get next job to process (for job workers)
CREATE OR REPLACE FUNCTION get_next_job_to_process()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  project_id UUID,
  job_type TEXT,
  input_data JSONB,
  processing_parameters JSONB,
  priority INTEGER
) SECURITY DEFINER AS $$
DECLARE
  v_job_record RECORD;
BEGIN
  -- Get the highest priority pending job
  SELECT aj.id, aj.user_id, aj.project_id, aj.job_type, 
         aj.input_data, aj.processing_parameters, aj.priority
  INTO v_job_record
  FROM public.ai_processing_jobs aj
  WHERE aj.job_status = 'pending'
  ORDER BY aj.priority DESC, aj.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  -- If we found a job, mark it as processing
  IF v_job_record.id IS NOT NULL THEN
    UPDATE public.ai_processing_jobs 
    SET job_status = 'processing'
    WHERE public.ai_processing_jobs.id = v_job_record.id;
    
    -- Return the job details
    RETURN QUERY
    SELECT v_job_record.id, v_job_record.user_id, v_job_record.project_id,
           v_job_record.job_type, v_job_record.input_data, 
           v_job_record.processing_parameters, v_job_record.priority;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- 7. SAMPLE DATA AND TESTING
-- =========================================

-- Test the job creation function
SELECT 'Testing job creation...' AS test_status;

-- Create a sample job (commented out for production)
/*
SELECT create_ai_processing_job(
  auth.uid(),
  NULL, -- project_id
  'design_generation',
  '{"image_url": "https://example.com/room.jpg", "style": "modern"}',
  '{"quality": "high", "variants": 3}',
  8,
  '{"source": "mobile_app", "version": "1.0"}'
);
*/

-- =========================================
-- 8. GRANT PERMISSIONS
-- =========================================

-- Grant necessary permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_processing_jobs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_ai_processing_job(UUID, UUID, TEXT, JSONB, JSONB, INTEGER, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_job_progress(UUID, TEXT, TEXT, INTEGER, TEXT[], JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_active_jobs(UUID) TO authenticated;

-- =========================================
-- SETUP COMPLETE
-- =========================================

SELECT 'AI Processing Jobs table and functions created successfully!' AS result;

-- =========================================
-- NEXT STEPS:
-- =========================================
-- 1. Implement job processing workers that poll get_next_job_to_process()
-- 2. Add real-time subscriptions in your React Native app to listen for job status updates
-- 3. Implement job retry logic with exponential backoff
-- 4. Set up monitoring and alerting for failed jobs
-- 5. Consider implementing job scheduling for resource management