import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { MapPin, List } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import { useQuery } from "@tanstack/react-query";

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const MapView = () => {
  const [user, setUser] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ['map-profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          company_name,
          short_description,
          slug,
          email,
          phone,
          website,
          latitude,
          longitude
        `)
        .eq('is_active', true)
        .eq('registration_completed', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      return data || [];
    },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Fix default icon
      const DefaultIcon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Center map on BiH
      mapInstanceRef.current = L.map(mapRef.current).setView([43.9159, 17.6791], 8);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when profiles change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing cluster group
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
    } else {
      // Initialize marker cluster group with optimized options
      markerClusterRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 200,
        chunkDelay: 50,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let size = 'small';
          if (count > 10) size = 'medium';
          if (count > 50) size = 'large';
          
          return L.divIcon({
            html: `<div class="marker-cluster-custom">${count}</div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(40, 40)
          });
        }
      });
      mapInstanceRef.current.addLayer(markerClusterRef.current);
    }

    // Add markers to cluster group in batches
    const batchSize = 100;
    let currentBatch = 0;

    const addBatch = () => {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, profiles.length);
      const batch = profiles.slice(start, end);

      batch.forEach((profile) => {
        if (profile.latitude && profile.longitude) {
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

          const marker = L.marker([Number(profile.latitude), Number(profile.longitude)], { 
            icon: customIcon 
          });

          const popupContent = `
            <div style="
              padding: 16px;
              min-width: 240px;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              <h3 style="
                font-weight: 600;
                font-size: 16px;
                color: hsl(222.2 47.4% 11.2%);
                margin-bottom: 8px;
              ">
                ${profile.company_name || `${profile.first_name} ${profile.last_name}`}
              </h3>
              ${profile.short_description ? `
                <p style="
                  font-size: 14px;
                  color: hsl(215.4 16.3% 46.9%);
                  margin-bottom: 12px;
                  line-height: 1.4;
                ">
                  ${profile.short_description}
                </p>
              ` : ''}
              <a href="/profil/${profile.slug}" style="
                display: inline-block;
                width: 100%;
                padding: 8px 16px;
                background: linear-gradient(135deg, hsl(222.2 47.4% 11.2%) 0%, hsl(217.2 32.6% 17.5%) 100%);
                color: white;
                text-align: center;
                border-radius: 6px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
              " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
                Pogledaj profil →
              </a>
            </div>
          `;

          marker.bindPopup(popupContent, {
            className: 'custom-popup',
            maxWidth: 300
          });

          markerClusterRef.current?.addLayer(marker);
        }
      });

      currentBatch++;
      if (end < profiles.length) {
        requestAnimationFrame(addBatch);
      }
    };

    if (profiles.length > 0) {
      addBatch();
    }
  }, [profiles]);

  const handleSearch = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.set('q', filters.searchTerm);
    if (filters.entity && filters.entity !== 'all') params.set('entity', filters.entity);
    if (filters.city && filters.city !== 'all') params.set('city', filters.city);
    filters.services?.forEach((service: string) => params.append('service', service));
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mapa knjigovođa</h1>
            <p className="text-muted-foreground">
              Pronađite knjigovođe u vašoj blizini
            </p>
          </div>
          <Link to="/">
            <Button variant="outline">
              <List className="h-4 w-4 mr-2" />
              Lista prikaz
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <SearchFilters onSearch={handleSearch} />
        </div>

        <div className="rounded-lg overflow-hidden shadow-large">
          <div 
            ref={mapRef} 
            className="w-full h-[700px] z-0"
            style={{ background: '#f0f0f0' }}
          />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Prikazano {profiles.length} profila na mapi
        </div>
      </div>
    </div>
  );
};

export default MapView;
