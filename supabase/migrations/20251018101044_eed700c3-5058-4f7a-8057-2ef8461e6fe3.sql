-- Add new columns to goals table (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='skill_id') THEN
    ALTER TABLE public.goals ADD COLUMN skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='current_value') THEN
    ALTER TABLE public.goals ADD COLUMN current_value INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='target_value') THEN
    ALTER TABLE public.goals ADD COLUMN target_value INTEGER DEFAULT 100;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='is_completed') THEN
    ALTER TABLE public.goals ADD COLUMN is_completed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;

CREATE POLICY "Users can view their own quizzes"
  ON public.quizzes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quizzes"
  ON public.quizzes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes"
  ON public.quizzes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes"
  ON public.quizzes FOR DELETE
  USING (auth.uid() = user_id);

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can create their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Users can delete their own resources" ON public.resources;

CREATE POLICY "Users can view their own resources"
  ON public.resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for resources updated_at
DROP TRIGGER IF EXISTS update_resources_updated_at ON public.resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update journal_entries to add new fields
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='journal_entries' AND column_name='goal_id') THEN
    ALTER TABLE public.journal_entries ADD COLUMN goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='journal_entries' AND column_name='title') THEN
    ALTER TABLE public.journal_entries ADD COLUMN title TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='journal_entries' AND column_name='reflection') THEN
    ALTER TABLE public.journal_entries ADD COLUMN reflection TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='journal_entries' AND column_name='date') THEN
    ALTER TABLE public.journal_entries ADD COLUMN date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;