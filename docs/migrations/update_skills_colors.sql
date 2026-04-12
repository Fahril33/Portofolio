-- Migration: Add custom styling columns to skill_items
-- Description: Adds text_color and bg_color to skill_items and populates them with brand colors based on labels.

-- 1. Add columns
ALTER TABLE public.skill_items 
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#3ECF8E';

-- 2. Populate brand colors for common skills (Case Insensitive Match)
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#339933' WHERE LOWER(label) LIKE '%node%';
UPDATE public.skill_items SET text_color = '#20232a', bg_color = '#61dafb' WHERE LOWER(label) LIKE '%react%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#3178c6' WHERE LOWER(label) LIKE '%typescript%';
UPDATE public.skill_items SET text_color = '#000000', bg_color = '#f7df1e' WHERE LOWER(label) LIKE '%javascript%' OR LOWER(label) LIKE '%js%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#3776ab' WHERE LOWER(label) LIKE '%python%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#06b6d4' WHERE LOWER(label) LIKE '%tail%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#3ecf8e' WHERE LOWER(label) LIKE '%supabase%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#e34f26' WHERE LOWER(label) LIKE '%html%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#1572b6' WHERE LOWER(label) LIKE '%css%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#f05032' WHERE LOWER(label) LIKE '%git%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#2496ed' WHERE LOWER(label) LIKE '%docker%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#4479a1' WHERE LOWER(label) LIKE '%mysql%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#336791' WHERE LOWER(label) LIKE '%postgre%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#ff6c37' WHERE LOWER(label) LIKE '%postman%';
UPDATE public.skill_items SET text_color = '#ffffff', bg_color = '#007acc' WHERE LOWER(label) LIKE '%vscode%';

-- 3. Ensure showcases tags is JSONB (safe migration)
ALTER TABLE public.showcases 
ALTER COLUMN tags TYPE JSONB USING tags::jsonb;

-- 4. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
