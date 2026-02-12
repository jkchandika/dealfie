import { Link } from 'react-router-dom';
import { Upload, Users, CheckCircle, Clock, TrendingUp, Shield } from 'lucide-react';

export function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">How It Works</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A simple, transparent way to buy and sell vehicles. No auctions, no pressure.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
            <Upload className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">1. List Your Vehicle</h3>
          <p className="text-gray-600">
            Sellers create a listing with photos, description, and asking price. The 24-hour offer window starts automatically.
          </p>
        </div>

        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
            <Users className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Receive Offers</h3>
          <p className="text-gray-600">
            Buyers submit their best offers during the 24-hour window. All offers are visible to the seller privately.
          </p>
        </div>

        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
            <CheckCircle className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Accept Best Offer</h3>
          <p className="text-gray-600">
            After the window closes, sellers review all offers and manually accept the one that works best for them.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Features</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <Clock className="text-primary flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">24-Hour Offer Window</h3>
              <p className="text-gray-600">
                Each listing has a fixed 24-hour period during which buyers can submit offers. This creates urgency while giving everyone a fair chance.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <TrendingUp className="text-primary flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Offer Range</h3>
              <p className="text-gray-600">
                We display both the highest and lowest offers publicly, giving everyone market visibility while keeping individual buyer details private.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Shield className="text-primary flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Seller Control</h3>
              <p className="text-gray-600">
                No automatic sales. Sellers always have final say and can choose to accept any offer, or none at all. You're always in control.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I make multiple offers on the same vehicle?</h3>
            <p className="text-gray-600">
              Yes, you can submit multiple offers during the 24-hour window. Each new offer is recorded and visible to the seller.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What happens after I accept an offer?</h3>
            <p className="text-gray-600">
              Once you accept an offer, the listing is marked as sold. You'll have access to the buyer's contact information to arrange payment and transfer.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I extend the 24-hour window?</h3>
            <p className="text-gray-600">
              No, the 24-hour window is fixed to maintain fairness and create urgency. Plan your listing timing accordingly.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Do I have to accept an offer?</h3>
            <p className="text-gray-600">
              No, you're never obligated to accept any offer. You can set a hidden minimum acceptable price, and only accept offers that meet your expectations.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors mr-4"
        >
          Browse Vehicles
        </Link>
        <Link
          to="/sell"
          className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
        >
          List Your Vehicle
        </Link>
      </div>
    </div>
  );
}
