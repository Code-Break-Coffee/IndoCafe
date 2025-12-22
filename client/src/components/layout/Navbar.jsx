import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <span className={`text-2xl font-bold ${isScrolled ? 'text-primary' : 'text-white'}`}>IndoCafe</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Home</a>
          <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Menu</a>
          <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}>About</a>
          <a href="#" className={`font-medium hover:text-primary transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Contact</a>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button className={`relative p-2 ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">0</span>
          </button>
          <Button variant={isScrolled ? 'primary' : 'white'} className="hidden md:block">
            Order Online
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
