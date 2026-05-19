-- Backfill windows_key, ms_office_key, antivirus_key on installations
-- that have no keys recorded, by reading from the linked product's custom_fields.
UPDATE installations i
SET
  windows_key = COALESCE(
    i.windows_key,
    p.custom_fields->>'windows_key',
    p.custom_fields->>'Windows_Key',
    p.custom_fields->>'window_key'
  ),
  ms_office_key = COALESCE(
    i.ms_office_key,
    p.custom_fields->>'ms_office_key',
    p.custom_fields->>'MS_Office_Key',
    p.custom_fields->>'office_key',
    p.custom_fields->>'Office_Key'
  ),
  antivirus_key = COALESCE(
    i.antivirus_key,
    p.custom_fields->>'antivirus_key',
    p.custom_fields->>'Antivirus_Key',
    p.custom_fields->>'antivirus'
  )
FROM products p
WHERE i.product_id = p.id
  AND p.custom_fields IS NOT NULL
  AND (
    i.windows_key   IS NULL OR
    i.ms_office_key IS NULL OR
    i.antivirus_key IS NULL
  );
