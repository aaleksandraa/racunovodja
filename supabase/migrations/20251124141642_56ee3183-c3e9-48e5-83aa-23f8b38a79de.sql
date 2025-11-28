-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Public can view categories
CREATE POLICY "Public can view blog categories"
ON public.blog_categories
FOR SELECT
USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage blog categories"
ON public.blog_categories
FOR ALL
USING (is_admin(auth.uid()));

-- Create blog tags table
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- Public can view tags
CREATE POLICY "Public can view blog tags"
ON public.blog_tags
FOR SELECT
USING (true);

-- Admins can manage tags
CREATE POLICY "Admins can manage blog tags"
ON public.blog_tags
FOR ALL
USING (is_admin(auth.uid()));

-- Add category_id to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL;

-- Create junction table for blog posts and tags (many-to-many)
CREATE TABLE public.blog_post_tags (
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  blog_tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (blog_post_id, blog_tag_id)
);

-- Enable RLS
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Public can view post tags
CREATE POLICY "Public can view blog post tags"
ON public.blog_post_tags
FOR SELECT
USING (true);

-- Admins can manage post tags
CREATE POLICY "Admins can manage blog post tags"
ON public.blog_post_tags
FOR ALL
USING (is_admin(auth.uid()));

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog images
CREATE POLICY "Public can view blog images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'blog-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'blog-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'blog-images' AND is_admin(auth.uid()));

-- Create indexes
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_post_tags_post ON public.blog_post_tags(blog_post_id);
CREATE INDEX idx_blog_post_tags_tag ON public.blog_post_tags(blog_tag_id);