/*
  # Clean Up Unused Indexes and Duplicate Policies

  1. Index Management
    - Drop unused indexes that are not being utilized
    - Indexes: idx_listings_seller_id, idx_listings_end_time, idx_offers_buyer_id
    - Note: These indexes are unused and consume storage/maintenance overhead

  2. Policy Consolidation
    - Remove duplicate INSERT policies for offers table
    - Keep one clear policy for authenticated users
    - Keep one clear policy for anonymous users
    - Maintain separate SELECT/UPDATE policies (intentional for buyer/seller access patterns)

  3. Security Notes
    - Multiple permissive policies for SELECT/UPDATE are by design
    - Buyers need to see their own offers
    - Sellers need to see offers on their listings
    - This is the correct security model for a marketplace
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_listings_seller_id;
DROP INDEX IF EXISTS idx_listings_end_time;
DROP INDEX IF EXISTS idx_offers_buyer_id;

-- Remove duplicate INSERT policies for offers
DROP POLICY IF EXISTS "Anonymous users can create valid offers" ON offers;
DROP POLICY IF EXISTS "Authenticated users can create valid offers" ON offers;

-- Keep the cleaner policy names from the previous migration:
-- "Anonymous can create offers" - for anon role
-- "Users can create offers" - for authenticated role