import { Helmet } from 'react-helmet-async';

interface ProfileStructuredDataProps {
  profile: any;
  services: any[];
  workingHours: any[];
}

export const ProfileStructuredData = ({ profile, services, workingHours }: ProfileStructuredDataProps) => {
  const displayName = profile.company_name || `${profile.first_name} ${profile.last_name}`;
  const isCompany = profile.business_type === 'company';

  // Build opening hours specification
  const openingHoursSpecification = workingHours
    .filter(h => !h.is_closed && h.start_time && h.end_time)
    .map(h => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": days[h.day_of_week],
        "opens": h.start_time,
        "closes": h.end_time
      };
    });

  // Build address
  const address = profile.business_city ? {
    "@type": "PostalAddress",
    "addressLocality": profile.business_city.name,
    "postalCode": profile.business_city.postal_code,
    "addressCountry": "BA"
  } : undefined;

  // Build geo coordinates
  const geo = (profile.latitude && profile.longitude) ? {
    "@type": "GeoCoordinates",
    "latitude": profile.latitude,
    "longitude": profile.longitude
  } : undefined;

  // Build service offerings
  const serviceOfferings = services.map(s => ({
    "@type": "Service",
    "name": s.service_categories.name,
    "description": s.service_categories.description
  })).filter(s => s.description);

  const structuredData = isCompany ? {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": displayName,
    "description": profile.short_description || profile.long_description,
    "url": `https://knjigovodje.ba/profil/${profile.slug}`,
    "image": profile.profile_image_url,
    "telephone": profile.phone,
    "email": profile.email,
    "address": address,
    "geo": geo,
    "openingHoursSpecification": openingHoursSpecification.length > 0 ? openingHoursSpecification : undefined,
    "hasOfferCatalog": serviceOfferings.length > 0 ? {
      "@type": "OfferCatalog",
      "name": "Računovodstvene usluge",
      "itemListElement": serviceOfferings
    } : undefined,
    "aggregateRating": profile.years_experience > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "1"
    } : undefined,
    "priceRange": "$$"
  } : {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": displayName,
    "description": profile.short_description || profile.long_description,
    "url": `https://knjigovodje.ba/profil/${profile.slug}`,
    "image": profile.profile_image_url,
    "telephone": profile.phone,
    "email": profile.email,
    "address": address,
    "jobTitle": "Knjigovođa / Računovođa",
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Accountant",
      "occupationLocation": {
        "@type": "Country",
        "name": "Bosnia and Herzegovina"
      }
    },
    "knowsAbout": services.map(s => s.service_categories.name),
    "alumniOf": profile.professional_organizations ? {
      "@type": "Organization",
      "name": profile.professional_organizations
    } : undefined
  };

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData));

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(cleanedData)}
      </script>
    </Helmet>
  );
};
