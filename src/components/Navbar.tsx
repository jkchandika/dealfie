import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Car className="text-primary" size={32} />
              <span className="font-semibold text-xl text-gray-900">VehicleOffer</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
                Buy
              </Link>
              <Link to="/how-it-works" className="text-gray-700 hover:text-primary transition-colors">
                How It Works
              </Link>

              {user ? (
                <>
                  {profile?.role === 'seller' && (
                    <>
                      <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                        Dashboard
                      </Link>
                      <Link
                        to="/sell"
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                      >
                        List Vehicle
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Login
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/"
                className="block text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Buy
              </Link>
              <Link
                to="/how-it-works"
                className="block text-gray-700 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>

              {user ? (
                <>
                  {profile?.role === 'seller' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block text-gray-700 hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/sell"
                        className="block w-full text-center bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        List Vehicle
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-700 hover:text-primary transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    </>
  );
}
