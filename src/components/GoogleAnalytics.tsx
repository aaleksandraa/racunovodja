import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

export const GoogleAnalytics = () => {
  const [gaId, setGaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGAId = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('google_analytics_id')
        .single();
      
      if (data?.google_analytics_id) {
        setGaId(data.google_analytics_id);
      }
    };

    fetchGAId();
  }, []);

  if (!gaId) return null;

  return (
    <Helmet>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </script>
    </Helmet>
  );
};
