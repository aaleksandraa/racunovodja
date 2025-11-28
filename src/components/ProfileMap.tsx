import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface ProfileMapProps {
  latitude: number;
  longitude: number;
  name: string;
  googleMapsUrl?: string;
}

const ProfileMap = ({ latitude, longitude, name, googleMapsUrl }: ProfileMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      // Create custom modern marker icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, hsl(222.2 47.4% 11.2%) 0%, hsl(217.2 32.6% 17.5%) 100%);
              border-radius: 50% 50% 50% 0;
              transform: translateX(-50%) rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              border: 3px solid white;
            "></div>
            <div style="
              position: absolute;
              top: 6px;
              left: 50%;
              transform: translateX(-50%);
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
              z-index: 1;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      // Create map
      mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], 15);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add marker with custom icon
      const marker = L.marker([latitude, longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      // Create modern popup content
      const popupContent = `
        <div style="
          padding: 12px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            font-weight: 600;
            font-size: 16px;
            color: hsl(222.2 47.4% 11.2%);
            margin-bottom: 8px;
          ">${name}</div>
          <div style="
            display: inline-block;
            padding: 4px 8px;
            background: hsl(214.3 31.8% 91.4%);
            color: hsl(222.2 47.4% 11.2%);
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          ">Lokacija</div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, name]);

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Lokacija nije dostupna</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg z-0"
        style={{ background: '#f0f0f0' }}
      />

      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full"
        >
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Navigacija → Google Maps
          </button>
        </a>
      )}
    </div>
  );
};

export default ProfileMap;
