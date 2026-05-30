-- Create dira_projects table
CREATE TABLE public.dira_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  custom_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add project_id to dira_conversations
ALTER TABLE public.dira_conversations 
ADD COLUMN project_id UUID REFERENCES public.dira_projects(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.dira_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for dira_projects
CREATE POLICY "Users can view own projects"
ON public.dira_projects
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects"
ON public.dira_projects
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
ON public.dira_projects
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
ON public.dira_projects
FOR DELETE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_dira_projects_updated_at
BEFORE UPDATE ON public.dira_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();