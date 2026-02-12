import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, TrendingUp, TrendingDown, Clock, MapPin, Share2, Check } from 'lucide-react';
import { supabase, Listing, Offer } from '../lib/supabase';
import { formatCurrency, getHighestOffer, getLowestOffer, isOfferWindowOpen } from '../lib/utils';
import { useCountdown } from '../hooks/useCountdown';
import { MakeOfferModal } from '../components/MakeOfferModal';
import { useAuth } from '../contexts/AuthContext';

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const timeRemaining = useCountdown(listing?.end_time || new Date(Date.now() + 86400000).toISOString());
  const highestOffer = listing ? getHighestOffer(offers) : null;
  const lowestOffer = listing ? getLowestOffer(offers) : null;
  const windowOpen = listing ? isOfferWindowOpen(listing.end_time) : false;
  const myOffer = user ? offers.find(offer => offer.buyer_id === user.id) : null;

  useEffect(() => {
    if (id) {
      loadListing(id);
    }
  }, [id]);

  const loadListing = async (listingId: string) => {
    try {
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .maybeSingle();

      if (listingError) throw listingError;
      setListing(listingData);

      const { data: offersData } = await supabase
        .from('offers')
        .select('*')
        .eq('listing_id', listingId)
        .order('offer_amount', { ascending: false });

      setOffers(offersData || []);
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferSubmitted = () => {
    if (id) {
      loadListing(id);
    }
  };

  const copyListingUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

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

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-600">Listing not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-primary">
            <ChevronLeft size={20} />
            <span>Back to listings</span>
          </Link>

          <button
            onClick={copyListingUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-600" />
                <span className="text-green-600 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={18} />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-card shadow-card overflow-hidden mb-6">
              <div className="aspect-[4/3] bg-gray-200">
                <img
                  src={listing.image_urls[selectedImage] || 'https://via.placeholder.com/800x600?text=No+Image'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {listing.image_urls.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.image_urls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img src={url} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-card shadow-card p-6">
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">{listing.title}</h1>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin size={18} className="mr-2" />
                <span>{listing.location}</span>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-card shadow-card p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock size={16} className="mr-2" />
                  <span className="font-medium">{timeRemaining}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Asking Price</p>
                    <p className="text-3xl font-semibold text-gray-900">
                      {formatCurrency(listing.asking_price)}
                    </p>
                  </div>

                  {offers.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600 mb-2">Offer Range</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center text-green-600">
                            <TrendingUp size={16} className="mr-1" />
                            Best Offer
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(highestOffer!)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-red-600">
                            <TrendingDown size={16} className="mr-1" />
                            Lowest Offer
                          </span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(lowestOffer!)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {myOffer && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">Your Offer</p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {formatCurrency(myOffer.offer_amount)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Submitted {new Date(myOffer.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              {windowOpen ? (
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  {myOffer ? 'Update Offer' : 'Make Offer'}
                </button>
              ) : (
                <div className="text-center py-3 bg-gray-100 rounded-lg text-gray-600 font-medium">
                  Offer Window Closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MakeOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        listing={listing}
        onOfferSubmitted={handleOfferSubmitted}
      />
    </>
  );
}
