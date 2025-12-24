import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface text-text pt-12 pb-8 border-t border-secondary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">IndoCafe</h3>
            <p className="text-secondary mb-4">Authentic Indonesian flavors delivered to your doorstep or served at our table.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-secondary">
              <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Menu</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-secondary">
              <li>123 Food Street, Culinary City</li>
              <li>+1 (555) 123-4567</li>
              <li>hello@indocafe.com</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Opening Hours</h4>
            <ul className="space-y-2 text-secondary">
              <li>Mon - Fri: 10:00 AM - 10:00 PM</li>
              <li>Sat - Sun: 09:00 AM - 11:00 PM</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary/10 pt-8 text-center text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} IndoCafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
