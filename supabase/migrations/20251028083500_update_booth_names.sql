-- Update booth names and voter counts for Thondamuthur constituency
-- Remove all booth names since we only want to display booth numbers
UPDATE public.booths 
SET name = NULL, total_voters = 250
WHERE booth_number = 1 
AND constituency_id = (
  SELECT id FROM public.constituencies WHERE number = 118 LIMIT 1
);

UPDATE public.booths 
SET name = NULL, total_voters = 280
WHERE booth_number = 2 
AND constituency_id = (
  SELECT id FROM public.constituencies WHERE number = 118 LIMIT 1
);

UPDATE public.booths 
SET name = NULL, total_voters = 220
WHERE booth_number = 3 
AND constituency_id = (
  SELECT id FROM public.constituencies WHERE number = 118 LIMIT 1
);