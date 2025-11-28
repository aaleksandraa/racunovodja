import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating sitemap.xml');

    // Fetch all active profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('slug, updated_at')
      .eq('is_active', true)
      .eq('registration_completed', true);

    // Fetch all service categories
    const { data: categories } = await supabase
      .from('service_categories')
      .select('id, updated_at')
      .is('parent_id', null);

    // Fetch all cities
    const { data: cities } = await supabase
      .from('cities')
      .select('id, name, postal_code, entities(code)');

    // Fetch all published blog posts
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true);

    // Fetch all profile services to determine service-city combinations
    const { data: profileServices } = await supabase
      .from('profile_services')
      .select(`
        service_id,
        profiles!inner(business_city_id, is_active, registration_completed)
      `);

    console.log('Fetched profile services for service-city combinations');

    const baseUrl = 'https://knjigovodje.ba';
    const now = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/mapa</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add profiles
    if (profiles) {
      for (const profile of profiles) {
        const lastmod = profile.updated_at?.split('T')[0] || now;
        sitemap += `
  <url>
    <loc>${baseUrl}/profil/${profile.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      }
    }

    // Add service categories
    if (categories) {
      for (const category of categories) {
        const lastmod = category.updated_at?.split('T')[0] || now;
        sitemap += `
  <url>
    <loc>${baseUrl}/usluge/${category.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }

    // Add city pages
    if (cities) {
      for (const city of cities) {
        sitemap += `
  <url>
    <loc>${baseUrl}/lokacije/${city.postal_code}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    // Add service + city combination pages
    if (profileServices && cities && categories) {
      // Build a map of service-city combinations
      const serviceCityMap = new Map<string, Set<string>>();
      
      for (const ps of profileServices as any[]) {
        const serviceId = ps.service_id;
        const cityId = ps.profiles?.business_city_id;
        const isActive = ps.profiles?.is_active;
        const isCompleted = ps.profiles?.registration_completed;
        
        if (serviceId && cityId && isActive && isCompleted) {
          if (!serviceCityMap.has(serviceId)) {
            serviceCityMap.set(serviceId, new Set());
          }
          serviceCityMap.get(serviceId)!.add(cityId);
        }
      }

      // Generate URLs for each service-city combination
      for (const [serviceId, cityIds] of serviceCityMap.entries()) {
        for (const cityId of cityIds) {
          const city = cities.find((c: any) => c.id === cityId);
          if (city) {
            sitemap += `
  <url>
    <loc>${baseUrl}/usluge/${serviceId}/${city.postal_code}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
          }
        }
      }
      
      console.log(`Generated ${serviceCityMap.size} service categories with city combinations`);
    }

    // Add blog posts
    if (blogPosts) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at?.split('T')[0] || now;
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    sitemap += '\n</urlset>';

    console.log(`Sitemap generated with ${profiles?.length || 0} profiles, ${categories?.length || 0} categories, ${cities?.length || 0} cities, ${blogPosts?.length || 0} blog posts, and service-city combinations`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
