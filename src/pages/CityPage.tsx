import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { CityStructuredData } from "@/components/CityStructuredData";
import Header from "@/components/Header";
import ProfileCard from "@/components/ProfileCard";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const CityPage = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Fetch city data
  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ["city", citySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select(`
          id,
          name,
          postal_code,
          entity_id,
          entities(name, code)
        `)
        .eq("postal_code", citySlug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("City not found");
      return data;
    },
  });

  // Fetch profiles from this city
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["city-profiles", city?.id],
    queryFn: async () => {
      if (!city?.id) return [];

      const { data, error } = await supabase
        .from("public_profiles")
        .select(`
          id,
          first_name,
          last_name,
          company_name,
          short_description,
          profile_image_url,
          slug,
          latitude,
          longitude,
          business_city_id,
          has_physical_office,
          works_online,
          years_experience
        `)
        .eq("business_city_id", city.id)
        .eq("is_active", true)
        .eq("registration_completed", true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!city?.id,
  });

  // Fetch available services in this city
  const { data: availableServices } = useQuery({
    queryKey: ["city-services", city?.id],
    queryFn: async () => {
      if (!city?.id || !profiles || profiles.length === 0) return [];

      const profileIds = profiles.map(p => p.id);

      // Get all services offered by profiles in this city
      const { data: profileServices, error } = await supabase
        .from("profile_services")
        .select(`
          service_id,
          service_categories (
            id,
            name,
            description,
            parent_id
          )
        `)
        .in("profile_id", profileIds);

      if (error) throw error;

      // Group services and count occurrences
      const serviceMap = new Map();
      profileServices?.forEach((ps: any) => {
        const service = ps.service_categories;
        if (service) {
          if (serviceMap.has(service.id)) {
            serviceMap.get(service.id).count++;
          } else {
            serviceMap.set(service.id, {
              ...service,
              count: 1
            });
          }
        }
      });

      return Array.from(serviceMap.values())
        .sort((a, b) => b.count - a.count);
    },
    enabled: !!city?.id && !!profiles && profiles.length > 0,
  });

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !profiles || profiles.length === 0) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const profilesWithCoords = profiles.filter(p => p.latitude && p.longitude);
    if (profilesWithCoords.length === 0) return;

    // Calculate center point
    const avgLat = profilesWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / profilesWithCoords.length;
    const avgLng = profilesWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / profilesWithCoords.length;

    // Create map
    const map = L.map(mapRef.current).setView([avgLat, avgLng], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers with clustering
    const markers = L.markerClusterGroup();

    profilesWithCoords.forEach((profile) => {
      const marker = L.marker([profile.latitude!, profile.longitude!]);
      
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-1">
            ${profile.company_name || `${profile.first_name} ${profile.last_name}`}
          </h3>
          <p class="text-xs text-muted-foreground mb-2">${profile.short_description || ''}</p>
          <a href="/profil/${profile.slug}" class="text-xs text-primary hover:underline">
            Pogledaj profil →
          </a>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markers.addLayer(marker);
    });

    map.addLayer(markers);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [profiles]);

  if (cityLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Header />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Grad nije pronađen</h1>
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Povratak na početnu
          </button>
        </div>
      </div>
    );
  }

  const entityName = (city as any).entities?.name || '';
  const cityName = city.name;
  const profileCount = profiles?.length || 0;

  const seoTitle = `Knjigovođe u ${cityName}`;
  const seoDescription = `Pronađite certificiranog knjigovođu u ${cityName}, ${entityName}. Lista od ${profileCount} računovođa i revizora u ${cityName} sa kontakt podacima i radnim vremenom.`;
  const seoKeywords = `knjigovođa ${cityName}, računovođa ${cityName}, knjigovodstvene usluge ${cityName}, revizor ${cityName}, knjigovođe ${entityName}`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/lokacije/${city.postal_code}`}
      />
      <CityStructuredData 
        city={city}
        profiles={profiles || []}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{entityName}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Knjigovođe u {cityName}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {profileCount === 0 
                ? `Trenutno nema registriranih knjigovođa u gradu ${cityName}.`
                : `Pronađeno ${profileCount} certificirani${profileCount === 1 ? '' : 'h'} knjigovođa u gradu ${cityName}.`
              }
            </p>
          </div>
        </section>

        {/* Available Services Section */}
        {availableServices && availableServices.length > 0 && (
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold mb-6">Dostupne usluge u {cityName}</h2>
              <p className="text-muted-foreground mb-8">
                Pregled usluga koje nude knjigovođe u gradu {cityName}. Kliknite na uslugu da vidite profesionalce specijalizovane za tu oblast.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableServices.map((service: any) => (
                  <Card 
                    key={service.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/usluge/${service.id}/${city.postal_code}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {service.count}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Profiles Grid */}
        {profiles && profiles.length > 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold mb-6">Svi knjigovođe u {cityName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>

              {/* Map Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Mapa lokacija</h2>
                <div 
                  ref={mapRef} 
                  className="w-full h-[500px] rounded-lg"
                />
              </Card>
            </div>
          </section>
        )}

        {profiles?.length === 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-6xl text-center">
              <p className="text-muted-foreground mb-4">
                Trenutno nema registriranih profesionalaca u ovom gradu.
              </p>
              <button
                onClick={() => navigate('/search')}
                className="text-primary hover:underline"
              >
                Pretražite druge lokacije →
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default CityPage;
