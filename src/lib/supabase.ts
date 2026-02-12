import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller';
  created_at: string;
};

export type Listing = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  asking_price: number;
  minimum_acceptable_price: number;
  location: string;
  image_urls: string[];
  status: 'active' | 'closed' | 'sold';
  start_time: string;
  end_time: string;
  created_at: string;
};

export type Offer = {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  buyer_name: string;
  buyer_phone: string;
  offer_amount: number;
  accepted: boolean;
  created_at: string;
};
