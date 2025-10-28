-- Add delete policy for surveys
CREATE POLICY "Allow public delete to surveys"
  ON public.surveys FOR DELETE
  USING (true);