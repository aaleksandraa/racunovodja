import { Helmet } from 'react-helmet-async';

interface ServiceCityStructuredDataProps {
  service: {
    id: string;
    name: string;
    description: string | null;
  };
  city: {
    name: string;
    postal_code: string;
    entities?: {
      name: string;
      code: string;
    };
  };
  profiles: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    short_description: string | null;
    slug: string | null;
    years_experience: number | null;
  }>;
}

export const ServiceCityStructuredData = ({ service, city, profiles }: ServiceCityStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${service.name} u ${city.name}`,
    "description": `Lista certificiranih profesionalaca za ${service.name} u gradu ${city.name}`,
    "numberOfItems": profiles.length,
    "itemListElement": profiles.map((profile, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": profile.company_name ? "LocalBusiness" : "Person",
        "@id": `https://knjigovodje.ba/profil/${profile.slug}`,
        "name": profile.company_name || `${profile.first_name} ${profile.last_name}`,
        "description": profile.short_description || `Profesionalne usluge ${service.name.toLowerCase()} u ${city.name}`,
        "url": `https://knjigovodje.ba/profil/${profile.slug}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.name,
          "addressCountry": "BA"
        },
        ...(profile.company_name && {
          "priceRange": "$$",
          "areaServed": {
            "@type": "City",
            "name": city.name
          }
        }),
        ...(profile.years_experience && {
          "knowsAbout": service.name,
          "yearsFounded": new Date().getFullYear() - profile.years_experience
        })
      }
    }))
  };

  // Additional BreadcrumbList for SEO
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Početna",
        "item": "https://knjigovodje.ba"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": service.name,
        "item": `https://knjigovodje.ba/usluge/${service.id}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": city.name,
        "item": `https://knjigovodje.ba/lokacije/${city.postal_code}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": `${service.name} u ${city.name}`,
        "item": `https://knjigovodje.ba/usluge/${service.id}/${city.postal_code}`
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
};
