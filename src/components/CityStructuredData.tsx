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
  citySlug?: string;
}

export const CityStructuredData = ({ city, profiles, citySlug }: CityStructuredDataProps) => {
  const baseUrl = 'https://racunovodja.online';
  const entityName = city.entities?.name || 'Bosna i Hercegovina';
  
  // Main ItemList for profiles
  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Računovođe i Knjigovođe u ${city.name}`,
    "description": `Lista od ${profiles.length} verificiranih računovođa i knjigovođa u gradu ${city.name}, ${entityName}`,
    "numberOfItems": profiles.length,
    "itemListElement": profiles.map((profile, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "AccountingService",
        "@id": `${baseUrl}/profil/${profile.slug}`,
        "name": profile.company_name || `${profile.first_name} ${profile.last_name}`,
        "description": profile.short_description || `Profesionalne računovodstvene i knjigovodstvene usluge u ${city.name}`,
        "url": `${baseUrl}/profil/${profile.slug}`,
        "areaServed": {
          "@type": "City",
          "name": city.name,
          "containedInPlace": {
            "@type": "Country",
            "name": "Bosna i Hercegovina"
          }
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.name,
          "postalCode": city.postal_code,
          "addressRegion": entityName,
          "addressCountry": "BA"
        }
      }
    }))
  };

  // BreadcrumbList for navigation
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Početna",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Računovođe",
        "item": `${baseUrl}/pretraga`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": city.name,
        "item": `${baseUrl}/grad/${citySlug || city.postal_code}`
      }
    ]
  };

  // FAQPage schema for FAQ section
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Kako pronaći dobrog računovođu u ${city.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Na našoj platformi možete pregledati profile ${profiles.length > 0 ? profiles.length : 'svih registrovanih'} računovođa u ${city.name}, uporediti njihove usluge, cijene i recenzije, te ih direktno kontaktirati. Svi računovođe su verificirani profesionalci.`
        }
      },
      {
        "@type": "Question",
        "name": `Koliko košta računovođa u ${city.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Cijena knjigovodstvenih usluga u ${city.name} varira ovisno o vrsti usluge i veličini posla. Kontaktirajte više računovođa za besplatnu procjenu i uporedite ponude.`
        }
      },
      {
        "@type": "Question",
        "name": `Koje usluge nude računovođe u ${city.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Računovođe u ${city.name} nude širok spektar usluga uključujući: vođenje poslovnih knjiga, obračun plata, porezno savjetovanje, izrada finansijskih izvještaja, revizija i konsalting.`
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(itemListData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqData)}
      </script>
    </Helmet>
  );
};
