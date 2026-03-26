-- Create a transactional delete function for rings
-- This ensures atomic delete + verification in a single DB transaction

CREATE OR REPLACE FUNCTION public.delete_ring_atomic(ring_id UUID)
RETURNS jsonb AS $$
DECLARE
  deleted_count INT;
  verify_count INT;
  ring_slug TEXT;
  ring_code TEXT;
  fk_error TEXT;
BEGIN
  -- Step 1: Get ring details before deletion (for logging/return)
  SELECT slug, code INTO ring_slug, ring_code FROM public.rings WHERE id = ring_id;
  
  IF ring_slug IS NULL THEN
    -- Ring doesn't exist
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_FOUND',
      'message', 'El anillo no existe'
    );
  END IF;

  -- Step 2: Attempt the delete (will fail if foreign key constraint exists)
  BEGIN
    DELETE FROM public.rings WHERE id = ring_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
  EXCEPTION WHEN foreign_key_violation THEN
    -- A foreign key constraint prevented the delete
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CONSTRAINT',
      'message', 'No se pudo eliminar porque está relacionado con otros datos.'
    );
  END;

  -- Step 3: Check if delete actually affected any rows
  IF deleted_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NOT_FOUND',
      'message', 'El anillo no existe'
    );
  END IF;

  -- Step 4: Verify deletion within same transaction
  SELECT COUNT(*) INTO verify_count FROM public.rings WHERE id = ring_id;
  
  IF verify_count > 0 THEN
    -- This should never happen in a transaction, but check anyway
    RETURN jsonb_build_object(
      'success', false,
      'error', 'VERIFY_FAILED',
      'message', 'No se pudo eliminar. Intenta de nuevo.'
    );
  END IF;

  -- Step 5: Success!
  RETURN jsonb_build_object(
    'success', true,
    'deleted_code', ring_code,
    'deleted_slug', ring_slug,
    'deleted_rows', deleted_count
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon role (for Supabase client)
GRANT EXECUTE ON FUNCTION public.delete_ring_atomic(UUID) TO anon, authenticated;
