-- Seed booths data for Thondamuthur constituency
-- Set all booth names to NULL since we only want to display booth numbers
INSERT INTO public.booths (constituency_id, booth_number, name, total_voters) 
SELECT c.id, 1, NULL, 250
FROM public.constituencies c
WHERE c.number = 118
AND NOT EXISTS (
  SELECT 1 FROM public.booths b 
  WHERE b.constituency_id = c.id AND b.booth_number = 1
);

INSERT INTO public.booths (constituency_id, booth_number, name, total_voters) 
SELECT c.id, 2, NULL, 280
FROM public.constituencies c
WHERE c.number = 118
AND NOT EXISTS (
  SELECT 1 FROM public.booths b 
  WHERE b.constituency_id = c.id AND b.booth_number = 2
);

INSERT INTO public.booths (constituency_id, booth_number, name, total_voters) 
SELECT c.id, 3, NULL, 220
FROM public.constituencies c
WHERE c.number = 118
AND NOT EXISTS (
  SELECT 1 FROM public.booths b 
  WHERE b.constituency_id = c.id AND b.booth_number = 3
);