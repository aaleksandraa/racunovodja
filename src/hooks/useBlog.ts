import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBlogPosts = (filters?: {
  categorySlug?: string;
  tagSlug?: string;
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ["blog-posts", filters],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, published_at, blog_categories(name, slug)")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (filters?.featured) {
        query = query.eq("show_on_homepage", true).limit(3);
      }

      if (filters?.categorySlug) {
        const { data: categories } = await supabase
          .from("blog_categories")
          .select("id")
          .eq("slug", filters.categorySlug)
          .maybeSingle();

        if (categories) {
          query = query.eq("category_id", categories.id);
        }
      }

      if (filters?.tagSlug) {
        const { data: tags } = await supabase
          .from("blog_tags")
          .select("id")
          .eq("slug", filters.tagSlug)
          .maybeSingle();

        if (tags) {
          const { data: postTags } = await supabase
            .from("blog_post_tags")
            .select("blog_post_id")
            .eq("blog_tag_id", tags.id);

          if (postTags) {
            const postIds = postTags.map((pt) => pt.blog_post_id);
            query = query.in("id", postIds);
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};

export const useBlogPost = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No slug provided");

      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          blog_categories(name, slug),
          blog_post_tags(blog_tags(name, slug))
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Post not found");

      return data;
    },
    enabled: !!slug,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });
};

export const useBlogTags = () => {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_tags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });
};
