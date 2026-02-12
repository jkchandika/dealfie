import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { supabase, Listing, Offer } from '../lib/supabase';
import { VehicleCard } from '../components/VehicleCard';
import { withRetry, getSupabaseErrorMessage } from '../lib/supabase-helper';

export function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Record<string, Offer[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setError(null);
    try {
      const result = await withRetry(async () => {
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        return listingsData || [];
      });

      setListings(result);

      const listingIds = result.map((l) => l.id);
      if (listingIds.length > 0) {
        const offersResult = await withRetry(async () => {
          const { data: offersData, error: offersError } = await supabase
            .from('offers')
            .select('*')
            .in('listing_id', listingIds);

          if (offersError) throw offersError;

          return offersData || [];
        });

        const offersMap: Record<string, Offer[]> = {};
        offersResult.forEach((offer) => {
          if (!offersMap[offer.listing_id]) {
            offersMap[offer.listing_id] = [];
          }
          offersMap[offer.listing_id].push(offer);
        });

        setOffers(offersMap);
      }
    } catch (err) {
      const errorMessage = getSupabaseErrorMessage(err);
      setError(errorMessage);
      console.error('Error loading listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const query = searchQuery.toLowerCase();
    return (
      listing.title.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 text-center">
            Find Your Next Vehicle
          </h1>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by vehicle or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-card focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-card p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Connection Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={loadListings}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        ) : filteredListings.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {searchQuery ? 'No vehicles found matching your search.' : 'No active listings at the moment.'}
            </p>
          </div>
        ) : !error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <VehicleCard
                key={listing.id}
                listing={listing}
                offers={offers[listing.id] || []}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
