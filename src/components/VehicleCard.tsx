import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, Share2, Check } from 'lucide-react';
import { Listing, Offer } from '../lib/supabase';
import { formatCurrency, getHighestOffer, getLowestOffer } from '../lib/utils';
import { useCountdown } from '../hooks/useCountdown';

interface VehicleCardProps {
  listing: Listing;
  offers: Offer[];
}

export function VehicleCard({ listing, offers }: VehicleCardProps) {
  const [copied, setCopied] = useState(false);
  const timeRemaining = useCountdown(listing.end_time);
  const highestOffer = getHighestOffer(offers);
  const lowestOffer = getLowestOffer(offers);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/listing/${listing.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="relative">
      <Link to={`/listing/${listing.id}`}>
        <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden bg-gray-200">
            <img
              src={listing.image_urls[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={listing.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>

            <div className="flex items-center text-sm text-gray-600 mb-3">
              <Clock size={14} className="mr-1" />
              <span>{timeRemaining}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Asking Price</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(listing.asking_price)}
                </span>
              </div>

              {offers.length > 0 ? (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-green-600">
                      <TrendingUp size={14} className="mr-1" />
                      Best Offer
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(highestOffer!)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-red-600">
                      <TrendingDown size={14} className="mr-1" />
                      Lowest Offer
                    </span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(lowestOffer!)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 italic text-center py-2">
                  No offers yet
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={handleShare}
        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors z-10"
        title="Share listing"
      >
        {copied ? (
          <Check size={18} className="text-green-600" />
        ) : (
          <Share2 size={18} className="text-gray-700" />
        )}
      </button>
    </div>
  );
}
