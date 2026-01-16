import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../features/home/HeroSection';
import ServiceTypeSelector from '../../features/home/ServiceTypeSelector';
import FeaturedItems from '../../features/home/FeaturedItems';
import OutletSelector from '../../components/layout/OutletSelector';
import ReservationModal from '../../components/reservation/ReservationModal';
import DineInModal from '../../components/layout/DineInModal';
import { useOutlet } from '../../context/OutletContextValues';
import { useCart } from '../../context/CartContextValues';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const Home = () => {
  const { outletId: routeOutletId, tableId } = useParams();
  const { selectedOutlet, isLoading, setOutlet } = useOutlet();
  const { setTableInfo, tableInfo } = useCart();
  // We can also have a state to force show selector if user wants to change
  const [showSelector, setShowSelector] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [showDineIn, setShowDineIn] = useState(false);
  const [tableLinkLoading, setTableLinkLoading] = useState(false);

  // When hitting /table/:tableId, fetch table details and set context
  useEffect(() => {
    if (!tableId) return;
    if (tableInfo && tableInfo.tableId === tableId) return;

    const fetchTable = async () => {
      setTableLinkLoading(true);
      try {
        const res = await api.get(`/api/public/table/${tableId}`);
        const table = res.data?.data || res.data;
        if (!table) throw new Error('Table not found');

        const tableOutletId = typeof table.outletId === 'string' ? table.outletId : table.outletId?._id;
        if (routeOutletId && tableOutletId && tableOutletId !== routeOutletId) {
          throw new Error('Table does not belong to this outlet');
        }

        // Update outlet context so menu/outlet-specific data aligns with the table
        if (table.outletId) {
          setOutlet(table.outletId);
        }

        setTableInfo({
          tableId: table._id,
          tableName: table.label,
          floor: table.floor,
        });
        toast.success(`Connected to Table ${table.label}`);
      } catch (error) {
        console.error('Failed to load table from link', error);
        toast.error('Invalid or unavailable table link');
      } finally {
        setTableLinkLoading(false);
      }
    };

    fetchTable();
  }, [tableId, routeOutletId, setOutlet, setTableInfo, tableInfo]);

  if (isLoading || tableLinkLoading) {
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
