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

    console.log('Generating RSS feed');

    // Fetch published blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('title, slug, excerpt, content, published_at, blog_categories(name)')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50);

    const baseUrl = 'https://knjigovodje.ba';
    const now = new Date().toUTCString();

    // Build RSS XML
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Knjigovođe BiH Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Najnoviji članci i savjeti o računovodstvu, knjigovodstvu i poreskim propisima u Bosni i Hercegovini</description>
    <language>bs</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />`;

    if (posts) {
      for (const post of posts) {
        const postUrl = `${baseUrl}/blog/${post.slug}`;
        const pubDate = new Date(post.published_at).toUTCString();
        const category = (post.blog_categories as any)?.name || '';
        
        // Clean content - remove HTML tags for description
        const cleanExcerpt = post.excerpt
          .replace(/<[^>]*>/g, '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        rss += `
    <item>
      <title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${cleanExcerpt}</description>`;
      
        if (category) {
          rss += `
      <category>${category.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</category>`;
        }
        
        rss += `
    </item>`;
      }
    }

    rss += `
  </channel>
</rss>`;

    console.log(`RSS feed generated with ${posts?.length || 0} posts`);

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
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
