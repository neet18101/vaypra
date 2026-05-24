-- Allow products to be deleted without cascading to installations.
-- installations.product_id becomes nullable; FK switches to ON DELETE SET NULL
-- so the installation record is preserved but product_id becomes NULL.

ALTER TABLE public.installations
  DROP CONSTRAINT installations_product_id_fkey;

ALTER TABLE public.installations
  ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.installations
  ADD CONSTRAINT installations_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES public.products(id)
  ON DELETE SET NULL;
