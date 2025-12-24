import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const OutletContext = createContext();

export const useOutlet = () => {
  return useContext(OutletContext);
};

export const OutletProvider = ({ children }) => {
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeOutlet = async () => {
      // 1. Check localStorage
      const savedOutlet = localStorage.getItem('selectedOutlet');
      if (savedOutlet) {
        setSelectedOutlet(JSON.parse(savedOutlet));
        setIsLoading(false);
        return;
      }

      // 2. Try Geolocation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await axios.get(`http://localhost:5000/api/public/outlets/nearest?lat=${latitude}&lng=${longitude}`);
              
              if (res.data.success) {
                const outlet = res.data.data;
                setSelectedOutlet(outlet);
                localStorage.setItem('selectedOutlet', JSON.stringify(outlet));
              }
            } catch (error) {
              console.error("Error finding nearest outlet:", error);
              // Fallback: User will have to select manually
            } finally {
              setIsLoading(false);
            }
          },
          (error) => {
            console.warn("Geolocation permission denied or error:", error);
            setIsLoading(false);
          }
        );
      } else {
        setIsLoading(false);
      }
    };

    initializeOutlet();
  }, []);

  const setOutlet = (outlet) => {
    setSelectedOutlet(outlet);
    localStorage.setItem('selectedOutlet', JSON.stringify(outlet));
  };

  const value = {
    selectedOutlet,
    isLoading,
    setOutlet
  };

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
};
