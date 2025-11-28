import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({ 
  title, 
  description, 
  keywords,
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url,
  type = "website"
}: SEOProps) => {
  const siteTitle = "Knjigovođe BiH";
  const fullTitle = `${title} | ${siteTitle}`;
  const fullUrl = url ? `https://knjigovodje.ba${url}` : "https://knjigovodje.ba";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* RSS Feed - only on blog pages */}
      {url?.includes('/blog') && (
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="Knjigovođe BiH Blog RSS Feed" 
          href="https://knjigovodje.ba/rss.xml" 
        />
      )}
    </Helmet>
  );
};
