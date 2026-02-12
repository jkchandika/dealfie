import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase, Listing } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onOfferSubmitted: () => void;
}

export function MakeOfferModal({ isOpen, onClose, listing, onOfferSubmitted }: MakeOfferModalProps) {
  const { user } = useAuth();
  const [offerAmount, setOfferAmount] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amount = parseFloat(offerAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Offer must be a valid amount greater than zero');
      setLoading(false);
      return;
    }

    if (amount >= listing.asking_price) {
      setError(`Offer must be lower than the asking price of ${formatCurrency(listing.asking_price)}`);
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('offers').insert({
        listing_id: listing.id,
        buyer_id: user?.id || null,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        offer_amount: amount,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        onOfferSubmitted();
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOfferAmount('');
    setBuyerName('');
    setBuyerPhone('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-2">Make an Offer</h2>
        <p className="text-gray-600 mb-6">
          Asking Price: <span className="font-semibold">{formatCurrency(listing.asking_price)}</span>
        </p>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <p className="text-lg font-medium text-gray-900">Offer Submitted!</p>
            <p className="text-gray-600 mt-2">The seller will review your offer.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Offer Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">Rs.</span>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                  required
                  min="1"
                  max={listing.asking_price - 1}
                  step="1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be lower than {formatCurrency(listing.asking_price)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Offer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
