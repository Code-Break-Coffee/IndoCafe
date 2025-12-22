import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../features/home/HeroSection';
import ServiceTypeSelector from '../../features/home/ServiceTypeSelector';
import FeaturedItems from '../../features/home/FeaturedItems';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ServiceTypeSelector />
        <FeaturedItems />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
