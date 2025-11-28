import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Briefcase } from "lucide-react";

const ServiceCategory = () => {
  const { categoryId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    setLoading(true);

    // Fetch main category
    const { data: categoryData } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (categoryData) {
      setCategory(categoryData);

      // Fetch subcategories
      const { data: subsData } = await supabase
        .from('service_categories')
        .select('*')
        .eq('parent_id', categoryId)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (subsData) {
        setSubcategories(subsData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Kategorija nije pronađena</h1>
          <Link to="/">
            <Button>Nazad na početnu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={category.name}
        description={category.description || `Pregledajte podkategorije i pronađite knjigovođu za ${category.name} usluge u Bosni i Hercegovini.`}
        keywords={`${category.name}, knjigovodstvene usluge, računovodstvo bih`}
        url={`/usluge/${categoryId}`}
      />
      <Header user={user} />

      <div className="container py-8">
        <Link to="/#usluge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Nazad na sve usluge
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-relaxed">{category.name}</h1>
                {category.description && (
                  <p className="text-muted-foreground mt-1 leading-relaxed">{category.description}</p>
                )}
              </div>
            </div>
          </div>

          {subcategories.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-6">Izaberite specifičnu uslugu</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {subcategories.map((sub) => (
                  <Link key={sub.id} to={`/search?service=${sub.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all hover-scale cursor-pointer">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between leading-relaxed">
                          {sub.name}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardTitle>
                        {sub.description && (
                          <CardDescription>{sub.description}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  Trenutno nema podkategorija za ovu uslugu.
                </p>
                <Link to={`/search?service=${category.id}`}>
                  <Button>
                    Pronađi knjigovođe za {category.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="mt-8">
            <Link to={`/search?service=${category.id}`}>
              <Button variant="outline" size="lg" className="w-full h-auto py-3 px-4 text-center leading-relaxed">
                Pregledaj sve knjigovođe iz kategorije "{category.name}"
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategory;
