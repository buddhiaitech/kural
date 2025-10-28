-- Add update and delete policies for families table
CREATE POLICY "Allow public update to families"
  ON public.families FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to families"
  ON public.families FOR DELETE
  USING (true);