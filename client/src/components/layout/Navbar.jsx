import React, { useState, useEffect } from 'react';
import { useOutlet } from '../../context/OutletContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import Button from '../ui/Button';
import { MapPin, ChevronDown, X, Loader2, Sun, Moon, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { selectedOutlet, setOutlet } = useOutlet();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showOutletModal, setShowOutletModal] = useState(false);
  const [allOutlets, setAllOutlets] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchOutlets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/public/outlets');
      if (res.data.success) {
        setAllOutlets(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch outlets", error);
    }
  };

  const handleOpenModal = () => {
    fetchOutlets();
    setShowOutletModal(true);
  };

  const handleSelectOutlet = (outlet) => {
    setOutlet(outlet);
    setShowOutletModal(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-surface/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <span className={`text-2xl font-bold text-primary`}>IndoCafe</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-text'}`}>Home</a>
            <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-text'}`}>Menu</a>
            <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-text'}`}>About</a>
            <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-text' : 'text-text'}`}>Contact</a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Outlet Selector */}
            <button 
              onClick={handleOpenModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isScrolled 
                  ? 'bg-background border-secondary/20 text-text hover:border-primary/50' 
                  : 'bg-surface/50 border-secondary/20 text-text hover:bg-surface backdrop-blur-sm'
              }`}
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span className="max-w-[150px] truncate">
                {selectedOutlet ? `Ordering from: ${selectedOutlet.name}` : 'Select Location'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isScrolled ? 'text-text hover:bg-secondary/10' : 'text-text hover:bg-surface/50'}`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <button className={`relative p-2 rounded-full transition-colors ${isScrolled ? 'text-text hover:bg-secondary/10' : 'text-text hover:bg-surface/50'}`}>
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute top-0 right-0 bg-primary text-on-primary text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
            </button>
            
            <Button variant="primary" className="hidden md:block">
              Order Online
            </Button>
          </div>
        </div>
      </nav>

      {/* Outlet Selection Modal */}
      {showOutletModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-secondary/10">
            <div className="p-4 border-b border-secondary/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text">Select an Outlet</h3>
              <button onClick={() => setShowOutletModal(false)} className="text-secondary hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {allOutlets.length > 0 ? (
                allOutlets.map((outlet) => (
                  <button
                    key={outlet._id}
                    onClick={() => handleSelectOutlet(outlet)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedOutlet?._id === outlet._id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-secondary/20 hover:border-primary/50 hover:bg-secondary/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-text">{outlet.name}</p>
                        <p className="text-sm text-secondary mt-1">{outlet.address}</p>
                      </div>
                      {selectedOutlet?._id === outlet._id && (
                        <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded-full">Selected</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-secondary">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-secondary/50" />
                  <p>Loading outlets...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
