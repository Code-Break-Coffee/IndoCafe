import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix for default marker icon missing in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle search control
const SearchField = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false, // We manage our own marker
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search address...',
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

// Component to handle map clicks and marker dragging
const LocationMarker = ({ position, setPosition, onChange }) => {
  const markerRef = useRef(null);

  // Handle map clicks
  useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      onChange(newPos);
    },
  });

  // Handle marker drag
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          const posObj = { lat: newPos.lat, lng: newPos.lng };
          setPosition(posObj);
          onChange(posObj);
        }
      },
    }),
    [onChange, setPosition]
  );

  return <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />;
};

const LocationPicker = ({ onChange, defaultPosition = { lat: 22.7196, lng: 75.8577 } }) => {
  const [position, setPosition] = useState(defaultPosition);

  return (
    <div className="h-[350px] w-full rounded-lg overflow-hidden border border-gray-300 z-0 relative">
      <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchField />
        <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
