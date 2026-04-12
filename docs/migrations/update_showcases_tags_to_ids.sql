-- Migration: Update showcases tags to store skill item IDs
-- Description: Converts existing string labels in showcases.tags into skill_items IDs for proper relational integrity.

-- We assume showcases.tags is already JSONB.
-- This script will replace array of labels/objects with an array of integers (skill_items.id).

DO $$ 
DECLARE
  showcase_row record;
  skill_match record;
  new_tags jsonb;
  item_val jsonb;
  v_label text;
  v_id integer;
BEGIN
  -- Loop through all showcases
  FOR showcase_row IN SELECT id, tags FROM public.showcases WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0 LOOP
    new_tags := '[]'::jsonb;
    
    -- Loop through each item in the tags array
    FOR item_val IN SELECT * FROM jsonb_array_elements(showcase_row.tags) LOOP
      v_label := NULL;
      
      -- Handle if the item is a string
      IF jsonb_typeof(item_val) = 'string' THEN
        v_label := item_val#>>'{}';
      -- Handle if the item is an object with a label property
      ELSIF jsonb_typeof(item_val) = 'object' AND item_val ? 'label' THEN
        v_label := item_val->>'label';
      -- Handle if the item is already a number (id)
      ELSIF jsonb_typeof(item_val) = 'number' THEN
        new_tags := new_tags || item_val;
        CONTINUE;
      END IF;

      IF v_label IS NOT NULL THEN
        -- Find the corresponding skill_items.id
        SELECT id INTO v_id FROM public.skill_items WHERE lower(label) = lower(v_label) LIMIT 1;
        
        IF v_id IS NOT NULL THEN
          -- Check if the ID is already in the new_tags array to avoid duplicates
          IF NOT new_tags @> to_jsonb(v_id) THEN
            new_tags := new_tags || to_jsonb(v_id);
          END IF;
        END IF;
      END IF;
    END LOOP;

    -- Update the showcase with the new tags array consisting of IDs
    UPDATE public.showcases SET tags = new_tags WHERE id = showcase_row.id;
  END LOOP;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
