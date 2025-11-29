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
      // Search by slug or postal_code
      const { data: cityData, error: cityError } = await supabase
        .from("cities")
        .select("id, name, postal_code, entity_id, entities(name, code)")
        .or(`slug.eq.${citySlug},postal_code.eq.${citySlug}`)
        .maybeSingle();
      
      if (cityError) throw cityError;
      if (!cityData) throw new Error("City not found");
      return cityData;
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
          business_street,
          has_physical_office,
          works_online,
          years_experience,
          license_type,
          is_license_verified,
          accepting_new_clients,
          email,
          phone,
          website
        `)
        .eq("business_city_id", city.id)
        .eq("is_active", true)
        .eq("registration_completed", true);

      if (error) throw error;
      
      // Add city info to each profile for ProfileCard
      return (data || []).map((profile: any) => ({
        ...profile,
        business_city: {
          name: city.name,
          postal_code: city.postal_code
        }
      }));
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

      const displayName = profile.company_name || `${profile.first_name} ${profile.last_name}`;
      const licenseText = profile.license_type === 'certified_accountant' 
        ? 'Certifikovani računovođa' 
        : profile.license_type === 'certified_technician'
          ? 'Certifikovani računovodstveni tehničar'
          : '';

      const popupContent = `
        <div style="padding: 12px; font-family: system-ui; min-width: 250px; max-width: 300px;">
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px; color: hsl(222.2 47.4% 11.2%);">
            ${displayName}
          </div>
          ${licenseText ? `
            <div style="font-size: 12px; color: ${profile.is_license_verified ? '#2563eb' : '#6b7280'}; margin-bottom: 8px;">
              ${licenseText}${profile.is_license_verified ? ' ✓' : ''}
            </div>
          ` : ''}
          ${profile.short_description ? `
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 10px; line-height: 1.4;">${profile.short_description}</p>
          ` : ''}
          
          <div style="margin-bottom: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
            <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">KONTAKT</div>
            ${profile.phone ? `<div style="font-size: 13px; margin-bottom: 4px;">📞 ${profile.phone}</div>` : ''}
            ${profile.email ? `<div style="font-size: 13px; margin-bottom: 4px;">✉️ ${profile.email}</div>` : ''}
            ${profile.website ? `<div style="font-size: 13px;"><a href="${profile.website}" target="_blank" style="color: #3b82f6; text-decoration: none;">🌐 Web stranica</a></div>` : ''}
          </div>
          
          ${profile.business_street || city.name ? `
            <div style="margin-bottom: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
              <div style="font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 6px;">ADRESA</div>
              <div style="font-size: 13px;">📍 ${profile.business_street ? profile.business_street + ', ' : ''}${city.name} ${city.postal_code || ''}</div>
            </div>
          ` : ''}
          
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
      
      const marker = L.marker([profile.latitude!, profile.longitude!], { icon: customIcon });
      marker.bindPopup(popupContent, { maxWidth: 320 });
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

  const entityName = (city as any).entities?.name || 'Bosna i Hercegovina';
  const cityName = city.name;
  const profileCount = profiles?.length || 0;

  // SEO optimized content
  const currentYear = new Date().getFullYear();
  const seoTitle = `Računovođe ${cityName} - ${profileCount > 0 ? profileCount : 'Lista'} Knjigovođa i Revizora ${currentYear}`;
  const seoDescription = `Pronađite najboljeg računovođu u ${cityName} ✓ Lista ${profileCount > 0 ? profileCount + ' verificiranih' : ''} knjigovođa i revizora u ${cityName}, ${entityName}. Uporedite cijene, usluge i recenzije. Besplatni kontakt podaci.`;
  const seoKeywords = `računovođa ${cityName}, knjigovođa ${cityName}, knjigovodstvene usluge ${cityName}, računovodstvene usluge ${cityName}, revizor ${cityName}, porezni savjetnik ${cityName}, ${cityName} računovođa, ${cityName} knjigovođa, knjigovodstvo ${cityName}, ${entityName} računovođa`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/grad/${citySlug}`}
      />
      <CityStructuredData 
        city={city}
        profiles={profiles || []}
        citySlug={citySlug}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12 px-1 sm:px-4">
          <div className="container mx-auto max-w-6xl px-2 sm:px-0">
            {/* Breadcrumbs for SEO */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
              <a href="/" className="hover:text-primary">Početna</a>
              <span>/</span>
              <a href="/pretraga" className="hover:text-primary">Računovođe</a>
              <span>/</span>
              <span className="text-foreground">{cityName}</span>
            </nav>
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{entityName}, Bosna i Hercegovina</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Računovođe i Knjigovođe u gradu {cityName}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {profileCount === 0 
                ? `Tražite računovođu u ${cityName}? Budite prvi koji će se registrovati kao računovođa u ${cityName}.`
                : `Pronađite pouzdanog računovođu u ${cityName}. Imamo ${profileCount} verificiranih računovođa i knjigovođa u gradu ${cityName} koji nude knjigovodstvene, računovodstvene i porezne usluge.`
              }
            </p>
            {/* Additional SEO text */}
            {profileCount > 0 && (
              <p className="text-muted-foreground">
                Uporedite cijene i usluge, pročitajte recenzije i kontaktirajte direktno računovođe u {cityName}.
              </p>
            )}
          </div>
        </section>

        {/* Available Services Section */}
        {availableServices && availableServices.length > 0 && (
          <section className="py-12 px-1 sm:px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl px-2 sm:px-0">
              <h2 className="text-3xl font-bold mb-6">Dostupne usluge u {cityName}</h2>
              <p className="text-muted-foreground mb-8">
                Pregled usluga koje nude knjigovođe u gradu {cityName}. Kliknite na uslugu da vidite profesionalce specijalizovane za tu oblast.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableServices.map((service: any) => (
                  <Card 
                    key={service.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/usluge/${service.id}/${citySlug}`)}
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
          <section className="py-12 px-1 sm:px-4">
            <div className="container mx-auto max-w-6xl px-2 sm:px-0">
              <h2 className="text-3xl font-bold mb-6">Svi Računovođe i Knjigovođe u {cityName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-12">
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
          <section className="py-12 px-1 sm:px-4">
            <div className="container mx-auto max-w-6xl text-center px-2 sm:px-0">
              <p className="text-muted-foreground mb-4">
                Trenutno nema registriranih profesionalaca u ovom gradu.
              </p>
              <button
                onClick={() => navigate('/pretraga')}
                className="text-primary hover:underline"
              >
                Pretražite druge lokacije →
              </button>
            </div>
          </section>
        )}

        {/* FAQ Section for SEO */}
        <section className="py-12 px-1 sm:px-4 bg-muted/20">
            <div className="container mx-auto max-w-6xl px-2 sm:px-0">
            <h2 className="text-2xl font-bold mb-8">Često Postavljana Pitanja - Računovođe {cityName}</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Kako pronaći dobrog računovođu u {cityName}?</h3>
                <p className="text-muted-foreground">
                  Na našoj platformi možete pregledati profile {profileCount > 0 ? profileCount : 'svih registrovanih'} računovođa u {cityName}, 
                  uporediti njihove usluge, cijene i recenzije, te ih direktno kontaktirati. Svi računovođe su verificirani profesionalci.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Koliko košta računovođa u {cityName}?</h3>
                <p className="text-muted-foreground">
                  Cijena knjigovodstvenih usluga u {cityName} varira ovisno o vrsti usluge i veličini posla. 
                  Kontaktirajte više računovođa za besplatnu procjenu i uporedite ponude.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Koje usluge nude računovođe u {cityName}?</h3>
                <p className="text-muted-foreground">
                  Računovođe u {cityName} nude širok spektar usluga uključujući: vođenje poslovnih knjiga, 
                  obračun plata, porezno savjetovanje, izrada finansijskih izvještaja, revizija i konsalting.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default CityPage;
