import Header from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlogPosts, useBlogCategories, useBlogTags } from "@/hooks/useBlog";

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCategory = searchParams.get("category");
  const selectedTag = searchParams.get("tag");

  const { data: posts = [], isLoading: postsLoading } = useBlogPosts({
    categorySlug: selectedCategory || undefined,
    tagSlug: selectedTag || undefined,
  });
  
  const { data: categories = [] } = useBlogCategories();
  const { data: tags = [] } = useBlogTags();

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <>
      <SEO
        title="Blog"
        description="Pročitajte najnovije članke i savjete o računovodstvu, knjigovodstvu i poreskim propisima u Bosni i Hercegovini."
        keywords="računovodstvo blog, knjigovodstvo savjeti, poreski propisi BiH, računovodstvene novosti"
        url="/blog"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                Najnoviji članci i savjeti o računovodstvu i knjigovodstvu
              </p>
              <a 
                href="/rss.xml" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                RSS Feed
              </a>
            </div>

            {/* Filters */}
            <div className="mb-8 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Kategorije</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={selectedCategory === cat.slug ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSearchParams({ category: cat.slug })}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Tagovi</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTag === tag.slug ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setSearchParams({ tag: tag.slug })}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {(selectedCategory || selectedTag) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Očisti filtere
                </Button>
              )}
            </div>

            {postsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Trenutno nema objavljenih članaka.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      {post.featured_image_url && (
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-2xl">{post.title}</CardTitle>
                            <CardDescription>
                              {format(new Date(post.published_at), "dd.MM.yyyy.")}
                              {post.blog_categories && ` • ${post.blog_categories.name}`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{post.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
