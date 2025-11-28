import { Helmet } from 'react-helmet-async';

interface CityStructuredDataProps {
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
  }>;
}

export const CityStructuredData = ({ city, profiles }: CityStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Knjigovođe u ${city.name}`,
    "description": `Lista certificiranih knjigovođa u gradu ${city.name}`,
    "numberOfItems": profiles.length,
    "itemListElement": profiles.map((profile, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": profile.company_name ? "LocalBusiness" : "Person",
        "@id": `https://knjigovodje.ba/profil/${profile.slug}`,
        "name": profile.company_name || `${profile.first_name} ${profile.last_name}`,
        "description": profile.short_description || `Profesionalne knjigovodstvene usluge u ${city.name}`,
        "url": `https://knjigovodje.ba/profil/${profile.slug}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.name,
          "addressCountry": "BA"
        }
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
