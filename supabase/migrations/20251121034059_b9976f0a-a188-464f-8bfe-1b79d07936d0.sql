-- Enable storage for deliverables and files
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-files', 'campaign-files', false);

-- Storage policies for deliverables
CREATE POLICY "Users can upload their own deliverables"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'deliverables' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view deliverables for their campaigns"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'deliverables' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.brand_id = auth.uid()
    )
  )
);

-- Storage policies for campaign files
CREATE POLICY "Brands can upload campaign files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-files' AND
  EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.brand_id = auth.uid()
  )
);

CREATE POLICY "Users can view campaign files for campaigns they're involved in"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'campaign-files' AND
  (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.brand_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM campaign_applications ca
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.creator_id = auth.uid()
    )
  )
);

-- Add milestones and deliverables tracking
CREATE TABLE public.campaign_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL,
  application_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.campaign_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones for their campaigns"
ON public.campaign_milestones
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaign_applications ca
    WHERE ca.id = application_id AND
    (ca.creator_id = auth.uid() OR EXISTS (
      SELECT 1 FROM campaigns c WHERE c.id = ca.campaign_id AND c.brand_id = auth.uid()
    ))
  )
);

CREATE POLICY "Creators can update their milestone status"
ON public.campaign_milestones
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM campaign_applications ca
    WHERE ca.id = application_id AND ca.creator_id = auth.uid()
  )
);

CREATE POLICY "Brands can manage milestones"
ON public.campaign_milestones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM campaign_applications ca
    JOIN campaigns c ON ca.campaign_id = c.id
    WHERE ca.id = application_id AND c.brand_id = auth.uid()
  )
);

-- Deliverable submissions
CREATE TABLE public.deliverable_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id uuid NOT NULL,
  file_url text NOT NULL,
  notes text,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'revision_requested', 'approved')),
  revision_notes text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.deliverable_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view submissions for their campaigns"
ON public.deliverable_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaign_milestones cm
    JOIN campaign_applications ca ON cm.application_id = ca.id
    WHERE cm.id = milestone_id AND
    (ca.creator_id = auth.uid() OR EXISTS (
      SELECT 1 FROM campaigns c WHERE c.id = ca.campaign_id AND c.brand_id = auth.uid()
    ))
  )
);

CREATE POLICY "Creators can submit deliverables"
ON public.deliverable_submissions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaign_milestones cm
    JOIN campaign_applications ca ON cm.application_id = ca.id
    WHERE cm.id = milestone_id AND ca.creator_id = auth.uid()
  )
);

CREATE POLICY "Brands can update submission status"
ON public.deliverable_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM campaign_milestones cm
    JOIN campaign_applications ca ON cm.application_id = ca.id
    JOIN campaigns c ON ca.campaign_id = c.id
    WHERE cm.id = milestone_id AND c.brand_id = auth.uid()
  )
);

-- Payment tracking
CREATE TABLE public.campaign_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'escrow' CHECK (status IN ('escrow', 'released', 'refunded')),
  released_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.campaign_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their campaigns"
ON public.campaign_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaign_applications ca
    WHERE ca.id = application_id AND
    (ca.creator_id = auth.uid() OR EXISTS (
      SELECT 1 FROM campaigns c WHERE c.id = ca.campaign_id AND c.brand_id = auth.uid()
    ))
  )
);

CREATE POLICY "Brands can manage payments"
ON public.campaign_payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM campaign_applications ca
    JOIN campaigns c ON ca.campaign_id = c.id
    WHERE ca.id = application_id AND c.brand_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_campaign_milestones_updated_at
BEFORE UPDATE ON public.campaign_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;