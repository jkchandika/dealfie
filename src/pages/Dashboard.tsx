import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, Listing, Offer } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, getHighestOffer, getLowestOffer } from '../lib/utils';
import { useCountdown } from '../hooks/useCountdown';

interface ListingWithOffers {
  listing: Listing;
  offers: Offer[];
}

export function Dashboard() {
  const { user } = useAuth();
  const [listingsWithOffers, setListingsWithOffers] = useState<ListingWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    try {
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      const listingIds = listingsData?.map((l) => l.id) || [];
      let offersMap: Record<string, Offer[]> = {};

      if (listingIds.length > 0) {
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .in('listing_id', listingIds)
          .order('offer_amount', { ascending: false });

        if (offersError) throw offersError;

        offersData?.forEach((offer) => {
          if (!offersMap[offer.listing_id]) {
            offersMap[offer.listing_id] = [];
          }
          offersMap[offer.listing_id].push(offer);
        });
      }

      const combined = listingsData?.map((listing) => ({
        listing,
        offers: offersMap[listing.id] || [],
      })) || [];

      setListingsWithOffers(combined);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId: string, listingId: string) => {
    try {
      await supabase
        .from('offers')
        .update({ accepted: true })
        .eq('id', offerId);

      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      loadListings();
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const activeListings = listingsWithOffers.filter((lwo) => lwo.listing.status === 'active');
  const closedListings = listingsWithOffers.filter((lwo) => lwo.listing.status !== 'active');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          to="/sell"
          className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Listing
        </Link>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Listings</h2>
          {activeListings.length === 0 ? (
            <div className="bg-white rounded-card shadow-card p-8 text-center">
              <p className="text-gray-600">No active listings. Create your first listing to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeListings.map(({ listing, offers }) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  offers={offers}
                  isSelected={selectedListing === listing.id}
                  onToggle={() => setSelectedListing(selectedListing === listing.id ? null : listing.id)}
                  onAcceptOffer={handleAcceptOffer}
                />
              ))}
            </div>
          )}
        </section>

        {closedListings.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Closed/Sold Listings</h2>
            <div className="space-y-4">
              {closedListings.map(({ listing, offers }) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  offers={offers}
                  isSelected={selectedListing === listing.id}
                  onToggle={() => setSelectedListing(selectedListing === listing.id ? null : listing.id)}
                  onAcceptOffer={handleAcceptOffer}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  offers,
  isSelected,
  onToggle,
  onAcceptOffer,
}: {
  listing: Listing;
  offers: Offer[];
  isSelected: boolean;
  onToggle: () => void;
  onAcceptOffer: (offerId: string, listingId: string) => void;
}) {
  const timeRemaining = useCountdown(listing.end_time);
  const highestOffer = getHighestOffer(offers);
  const lowestOffer = getLowestOffer(offers);

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={listing.image_urls[0] || 'https://via.placeholder.com/200x150?text=No+Image'}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                <p className="text-sm text-gray-600">{listing.location}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  listing.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : listing.status === 'sold'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Asking Price</p>
                <p className="text-lg font-semibold">{formatCurrency(listing.asking_price)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Time Left</p>
                <p className="text-sm font-medium flex items-center">
                  <Clock size={14} className="mr-1" />
                  {timeRemaining}
                </p>
              </div>
              {offers.length > 0 && (
                <>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Best Offer</p>
                    <p className="text-lg font-semibold text-green-600 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      {formatCurrency(highestOffer!)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Lowest Offer</p>
                    <p className="text-lg font-semibold text-red-600 flex items-center">
                      <TrendingDown size={14} className="mr-1" />
                      {formatCurrency(lowestOffer!)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onToggle}
              className="mt-4 text-primary font-medium text-sm hover:underline"
            >
              {isSelected ? 'Hide' : 'View'} {offers.length} Offer{offers.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {isSelected && offers.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">Offers Received</h4>
            <div className="space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{offer.buyer_name}</p>
                    <p className="text-sm text-gray-600">{offer.buyer_phone}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(offer.offer_amount)}
                    </p>
                    {!offer.accepted && listing.status === 'active' && (
                      <button
                        onClick={() => onAcceptOffer(offer.id, listing.id)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
                      >
                        Accept
                      </button>
                    )}
                    {offer.accepted && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Accepted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
