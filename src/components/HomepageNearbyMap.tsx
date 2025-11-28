import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  business_type: string | null;
  slug: string;
  latitude: number;
  longitude: number;
  email: string | null;
  phone: string | null;
  website: string | null;
  services?: Array<{ name: string }>;
  working_hours?: Array<{
    day_of_week: number;
    start_time: string | null;
    end_time: string | null;
    is_closed: boolean | null;
  }>;
}

const HomepageNearbyMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);

  // Fetch site settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('show_map_search')
        .single();
      
      if (data) {
        setShowMapSearch(data.show_map_search || false);
      }
    };
    
    fetchSettings();
  }, []);

  // Fetch profiles with detailed data
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, company_name, business_type, slug, latitude, longitude, email, phone, website')
        .eq('is_active', true)
        .eq('registration_completed', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      if (profilesData) {
        // Fetch services and working hours for each profile
        const profilesWithDetails = await Promise.all(
          profilesData.map(async (profile) => {
            const [servicesRes, hoursRes] = await Promise.all([
              supabase
                .from('profile_services')
                .select('service_categories(name)')
                .eq('profile_id', profile.id)
                .limit(3),
              supabase
                .from('working_hours')
                .select('day_of_week, start_time, end_time, is_closed')
                .eq('profile_id', profile.id)
                .order('day_of_week', { ascending: true })
            ]);

            return {
              ...profile,
              services: servicesRes.data?.map(s => ({ name: s.service_categories?.name || '' })) || [],
              working_hours: hoursRes.data || []
            };
          })
        );
        
        setProfiles(profilesWithDetails);
      }
    };

    fetchProfiles();
  }, []);

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = profiles.filter((profile) => {
      const firstName = profile.first_name.toLowerCase();
      const lastName = profile.last_name.toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const companyName = profile.company_name?.toLowerCase() || '';
      
      return (
        fullName.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        companyName.includes(query)
      );
    });

    setFilteredProfiles(filtered);
  }, [searchQuery, profiles]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          setLocationError(true);
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !userLocation || profiles.length === 0) return;

    if (!mapInstanceRef.current) {
      // Create map centered on user location with closer zoom (zoom 13 ≈ 5-10km radius view)
      mapInstanceRef.current = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 20px;
              height: 20px;
              background: #3b82f6;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<strong>Vaša lokacija</strong>');

      // Initialize marker cluster group
      markerClusterGroupRef.current = (L as any).markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 80,
      });
      mapInstanceRef.current.addLayer(markerClusterGroupRef.current);
    }

    // Clear existing markers from cluster group
    if (markerClusterGroupRef.current) {
      markerClusterGroupRef.current.clearLayers();
    }

    // Helper function to format working hours
    const formatWorkingHours = (hours: Profile['working_hours']) => {
      if (!hours || hours.length === 0) return 'Nisu dostupni podaci';
      
      const days = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
      const todayHours = hours.find(h => h.day_of_week === new Date().getDay());
      
      if (!todayHours) return 'Nisu dostupni podaci';
      if (todayHours.is_closed) return 'Zatvoreno danas';
      if (!todayHours.start_time || !todayHours.end_time) return 'Nisu dostupni podaci';
      
      return `Danas: ${todayHours.start_time.slice(0, 5)} - ${todayHours.end_time.slice(0, 5)}`;
    };

    // Add markers for each profile
    filteredProfiles.forEach((profile) => {
      if (!mapInstanceRef.current || !markerClusterGroupRef.current) return;

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

      const displayName = profile.business_type === 'company' && profile.company_name 
        ? profile.company_name 
        : `${profile.first_name} ${profile.last_name}`;

      const servicesText = profile.services && profile.services.length > 0
        ? profile.services.map(s => s.name).filter(Boolean).join(', ')
        : 'Nisu navedene usluge';

      const popupContent = `
        <div style="padding: 12px; font-family: system-ui; min-width: 250px; max-width: 300px;">
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 12px; color: hsl(222.2 47.4% 11.2%);">
            ${displayName}
          </div>
          
          <div style="margin-bottom: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">KONTAKT</div>
            ${profile.phone ? `<div style="font-size: 13px; margin-bottom: 4px;">📞 ${profile.phone}</div>` : ''}
            ${profile.email ? `<div style="font-size: 13px; margin-bottom: 4px;">✉️ ${profile.email}</div>` : ''}
            ${profile.website ? `<div style="font-size: 13px;"><a href="${profile.website}" target="_blank" style="color: #3b82f6; text-decoration: none;">🌐 Web stranica</a></div>` : ''}
          </div>
          
          <div style="margin-bottom: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">RADNO VREME</div>
            <div style="font-size: 13px;">${formatWorkingHours(profile.working_hours)}</div>
          </div>
          
          <div style="margin-bottom: 12px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">USLUGE</div>
            <div style="font-size: 13px; line-height: 1.4;">${servicesText}</div>
          </div>
          
          <a href="/profil/${profile.slug}" style="
            display: block;
            text-align: center;
            padding: 8px 16px;
            background: hsl(222.2 47.4% 11.2%);
            color: white;
            border-radius: 6px;
            font-size: 13px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 12px;
          ">Pogledaj kompletan profil</a>
        </div>
      `;

      const marker = L.marker([profile.latitude, profile.longitude], { icon: customIcon })
        .bindPopup(popupContent, { maxWidth: 320 });

      markerClusterGroupRef.current.addLayer(marker);
    });

    return () => {
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current.clearLayers();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, filteredProfiles]);

  if (loading) {
    return (
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Učitavanje lokacije...</p>
          </div>
        </div>
      </section>
    );
  }

  if (locationError) {
    return (
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
              Mapa
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Profesionalci u vašoj blizini</h2>
          </div>
          <div className="text-center py-16 bg-card rounded-3xl border border-border/50">
            <div className="max-w-md mx-auto space-y-4">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-xl font-semibold">Omogućite pristup lokaciji</p>
              <p className="text-muted-foreground">
                Da bismo vam prikazali profesionalce u vašoj blizini, potreban nam je pristup vašoj lokaciji.
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                <Navigation className="mr-2 h-4 w-4" />
                Pokušaj ponovo
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (profiles.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-24 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full text-sm font-semibold text-primary mb-6">
            Mapa
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Profesionalci u vašoj blizini</h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            Plavi pin prikazuje vašu trenutnu lokaciju
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {showMapSearch && (
            <div className="mb-4 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Pretražite po imenu profesionalca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Prikazano {filteredProfiles.length} od {profiles.length} profesionalaca
                </p>
              )}
            </div>
          )}
          
          <div 
            ref={mapRef} 
            className="w-full h-[500px] rounded-2xl shadow-large z-0"
            style={{ background: '#f0f0f0' }}
          />
          
          <div className="mt-8 text-center">
            <Link to="/mapa">
              <Button size="lg" variant="outline" className="font-semibold">
                <MapPin className="h-5 w-5 mr-2" />
                Pogledaj punu mapu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageNearbyMap;
