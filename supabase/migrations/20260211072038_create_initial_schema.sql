/*
  # Initial Vehicle Reverse-Bidding Platform Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `name` (text)
      - `role` (text, either 'buyer' or 'seller')
      - `created_at` (timestamptz)
    
    - `listings`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `asking_price` (decimal)
      - `minimum_acceptable_price` (decimal, hidden from buyers)
      - `location` (text)
      - `image_urls` (text array)
      - `status` (text: 'active', 'closed', 'sold')
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `created_at` (timestamptz)
    
    - `offers`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings)
      - `buyer_name` (text)
      - `buyer_phone` (text)
      - `offer_amount` (decimal)
      - `accepted` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all profiles, but only update their own
    - Listings: Public can view active listings, sellers can create and manage their own
    - Offers: Sellers can view offers for their listings, anyone can submit offers
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller')),
  created_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  asking_price decimal(10,2) NOT NULL CHECK (asking_price > 0),
  minimum_acceptable_price decimal(10,2) NOT NULL CHECK (minimum_acceptable_price > 0),
  location text NOT NULL,
  image_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'sold')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  buyer_name text NOT NULL,
  buyer_phone text NOT NULL,
  offer_amount decimal(10,2) NOT NULL CHECK (offer_amount > 0),
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_end_time ON listings(end_time);
CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Listings policies
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Sellers can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'seller'
    )
  );

CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Offers policies
CREATE POLICY "Anyone can create offers"
  ON offers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sellers can view offers for their listings"
  ON offers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = offers.listing_id 
      AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update offers for their listings"
  ON offers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = offers.listing_id 
      AND listings.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = offers.listing_id 
      AND listings.seller_id = auth.uid()
    )
  );