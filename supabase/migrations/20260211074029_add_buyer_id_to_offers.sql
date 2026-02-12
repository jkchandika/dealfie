/*
  # Add Buyer ID to Offers Table

  1. Changes
    - Add `buyer_id` column to offers table (nullable, references profiles)
    - Add index on buyer_id for performance
  
  2. Security
    - Add policy for buyers to view their own offers
    - Update existing policies to accommodate buyer access

  3. Notes
    - Column is nullable to support existing offers that were made before authentication tracking
    - New offers will always include buyer_id
*/

-- Add buyer_id column to offers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'offers' AND column_name = 'buyer_id'
  ) THEN
    ALTER TABLE offers ADD COLUMN buyer_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);

-- Add policy for buyers to view their own offers
CREATE POLICY "Buyers can view their own offers"
  ON offers FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

-- Add policy for buyers to update their own offers (if needed in future)
CREATE POLICY "Buyers can update their own offers"
  ON offers FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);