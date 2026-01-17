import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContextValues';
import { useOutlet } from '../../context/OutletContextValues';
import { useTheme } from '../../context/useTheme';
import Button from '../ui/Button';
import { MapPin, ChevronDown, Sun, Moon, ShoppingBag, X, Loader2 } from 'lucide-react';
import OutletSelector from './OutletSelector';

const Navbar = ({ onOpenOutletSelector }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { selectedOutlet } = useOutlet();
  const { isDarkMode, toggleTheme } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const [showInternalOutletModal, setShowInternalOutletModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOutletClick = () => {
    if (onOpenOutletSelector) {
      onOpenOutletSelector();
    } else {
      setShowInternalOutletModal(true);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-surface/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <span className={`text-2xl font-bold text-primary`}>IndoCafe</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-white'}`}
            >
              Home
            </a>
            <a
              href="#"
              className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-white'}`}
            >
              Menu
            </a>
            <a
              href="#"
              className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-white'}`}
            >
              About
            </a>
            <a
              href="#"
              className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-white'}`}
            >
              Contact
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Outlet Selector */}
            <button
              onClick={handleOutletClick}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isScrolled
                  ? 'bg-background border-secondary/20 text-text hover:border-primary/50'
                  : 'bg-surface/50 border-secondary/20 text-text hover:bg-surface backdrop-blur-sm'
              }`}
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span className="max-w-[150px] truncate">
                {selectedOutlet ? `Order: ${selectedOutlet.name}` : 'Select Location'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-text hover:bg-secondary/10' : 'hover:bg-surface/50 text-white hover:text-text'}`}
            >
              {!isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`relative p-2 rounded-full transition-colors ${isScrolled ? 'text-text hover:bg-secondary/10' : 'hover:bg-surface/50 text-white hover:text-text'}`}
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-on-primary text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <Button variant="primary" className="hidden md:block">
              Order Online
            </Button>
          </div>
        </div>
      </nav>

      {/* Internal Outlet Selection Modal (Fallback) */}
      {showInternalOutletModal && <OutletSelector onClose={() => setShowInternalOutletModal(false)} />}
    </>
  );
};

export default Navbar;
