import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../features/home/HeroSection';
import ServiceTypeSelector from '../../features/home/ServiceTypeSelector';
import FeaturedItems from '../../features/home/FeaturedItems';
import OutletSelector from '../../components/layout/OutletSelector';
import ReservationModal from '../../components/reservation/ReservationModal';
import DineInModal from '../../components/layout/DineInModal';
import { useOutlet } from '../../context/OutletContextValues';

const Home = () => {
  const { selectedOutlet, isLoading } = useOutlet();

  const [showSelector, setShowSelector] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [showDineIn, setShowDineIn] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        Preparing your table...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {(!selectedOutlet || showSelector) && <OutletSelector onClose={() => setShowSelector(false)} />}

      {showReservation && <ReservationModal onClose={() => setShowReservation(false)} />}

      {showDineIn && <DineInModal onClose={() => setShowDineIn(false)} />}

      <Navbar onOpenOutletSelector={() => setShowSelector(true)} />
      <main className="grow">
        <HeroSection onBookTable={() => setShowReservation(true)} />
        <ServiceTypeSelector onDineIn={() => setShowDineIn(true)} />
        <FeaturedItems />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
