-- Create constituencies table
CREATE TABLE public.constituencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booths table
CREATE TABLE public.booths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  constituency_id UUID NOT NULL REFERENCES public.constituencies(id) ON DELETE CASCADE,
  booth_number INTEGER NOT NULL,
  name TEXT,
  total_voters INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(constituency_id, booth_number)
);

-- Create families table
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id TEXT NOT NULL UNIQUE,
  booth_id UUID NOT NULL REFERENCES public.booths(id) ON DELETE CASCADE,
  address TEXT,
  survey_status TEXT DEFAULT 'pending' CHECK (survey_status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create voters table
CREATE TABLE public.voters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone_number TEXT,
  address TEXT NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  booth_id UUID NOT NULL REFERENCES public.booths(id) ON DELETE CASCADE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified')),
  special_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create surveys table
CREATE TABLE public.surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  booth_id UUID NOT NULL REFERENCES public.booths(id) ON DELETE CASCADE,
  survey_data JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for now, since we don't have auth yet)
CREATE POLICY "Allow public read access to constituencies"
  ON public.constituencies FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to booths"
  ON public.booths FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to families"
  ON public.families FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to voters"
  ON public.voters FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to surveys"
  ON public.surveys FOR SELECT
  USING (true);

-- Allow public insert/update/delete for now (will add proper auth later)
CREATE POLICY "Allow public insert to voters"
  ON public.voters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to voters"
  ON public.voters FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to voters"
  ON public.voters FOR DELETE
  USING (true);

CREATE POLICY "Allow public insert to families"
  ON public.families FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to surveys"
  ON public.surveys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to surveys"
  ON public.surveys FOR UPDATE
  USING (true);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voters
CREATE TRIGGER update_voters_updated_at
  BEFORE UPDATE ON public.voters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial constituency data
INSERT INTO public.constituencies (number, name) VALUES
  (118, 'Thondamuthur'),
  (119, 'To be updated'),
  (120, 'To be updated'),
  (121, 'To be updated'),
  (122, 'To be updated'),
  (123, 'To be updated'),
  (124, 'To be updated'),
  (125, 'To be updated'),
  (126, 'To be updated'),
  (127, 'To be updated'),
  (128, 'To be updated'),
  (129, 'To be updated'),
  (130, 'To be updated'),
  (131, 'To be updated'),
  (132, 'To be updated'),
  (133, 'To be updated'),
  (134, 'To be updated'),
  (135, 'To be updated'),
  (136, 'To be updated'),
  (137, 'To be updated'),
  (138, 'To be updated');