import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { ServiceCityStructuredData } from "@/components/ServiceCityStructuredData";
import Header from "@/components/Header";
import ProfileCard from "@/components/ProfileCard";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Briefcase } from "lucide-react";
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

const ServiceCityPage = () => {
  const { serviceSlug, citySlug } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Fetch service data
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ["service", serviceSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name, description")
        .eq("id", serviceSlug)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Service not found");
      return data;
    },
  });

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

  // Fetch profiles that match both service and city
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["service-city-profiles", service?.id, city?.id],
    queryFn: async () => {
      if (!service?.id || !city?.id) return [];

      // First, get profile IDs that offer this service
      const { data: profileServices, error: servicesError } = await supabase
        .from("profile_services")
        .select("profile_id")
        .eq("service_id", service.id);

      if (servicesError) throw servicesError;
      if (!profileServices || profileServices.length === 0) return [];

      const profileIds = profileServices.map(ps => ps.profile_id);

      // Then, fetch profiles that are in this city
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
        .in("id", profileIds)
        .eq("business_city_id", city.id)
        .eq("is_active", true)
        .eq("registration_completed", true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!service?.id && !!city?.id,
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
    const map = L.map(mapRef.current).setView([avgLat, avgLng], 13);
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

  if (serviceLoading || cityLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service || !city) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Header />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {!service ? "Usluga nije pronađena" : "Grad nije pronađen"}
          </h1>
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
  const serviceName = service.name;
  const profileCount = profiles?.length || 0;

  const seoTitle = `${serviceName} u ${cityName}`;
  const seoDescription = `Pronađite profesionalca za ${serviceName.toLowerCase()} u ${cityName}, ${entityName}. Lista od ${profileCount} certificiranih knjigovođa specijaliziranih za ${serviceName.toLowerCase()} sa kontakt podacima.`;
  const seoKeywords = `${serviceName} ${cityName}, ${serviceName} ${entityName}, knjigovođa ${cityName}, računovođa ${cityName}, ${serviceName.toLowerCase()}`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/usluge/${serviceSlug}/${citySlug}`}
      />
      <ServiceCityStructuredData 
        service={service}
        city={city}
        profiles={profiles || []}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{serviceName}</span>
              </div>
              <span className="text-muted-foreground/50">•</span>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{cityName}, {entityName}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {serviceName} u {cityName}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {profileCount === 0 
                ? `Trenutno nema registriranih profesionalaca za ${serviceName.toLowerCase()} u gradu ${cityName}.`
                : `Pronađeno ${profileCount} certificiran${profileCount === 1 ? '' : 'ih'} profesionalac${profileCount === 1 ? '' : 'a'} za ${serviceName.toLowerCase()} u gradu ${cityName}.`
              }
            </p>
          </div>
        </section>

        {/* Profiles Grid */}
        {profiles && profiles.length > 0 && (
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-6xl">
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
                Trenutno nema profesionalaca koji nude {serviceName.toLowerCase()} u {cityName}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate(`/lokacije/${citySlug}`)}
                  className="text-primary hover:underline"
                >
                  Pogledaj sve knjigovođe u {cityName} →
                </button>
                <span className="text-muted-foreground/50">ili</span>
                <button
                  onClick={() => navigate(`/search?service=${serviceSlug}`)}
                  className="text-primary hover:underline"
                >
                  Pretražite {serviceName.toLowerCase()} u drugim gradovima →
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ServiceCityPage;
