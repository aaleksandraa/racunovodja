import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ImageUpload from "@/components/ImageUpload";
import GalleryUpload from "@/components/GalleryUpload";
import EditPersonalData from "@/components/profile-edit/EditPersonalData";
import EditBusinessData from "@/components/profile-edit/EditBusinessData";
import EditServices from "@/components/profile-edit/EditServices";
import EditWorkingHours from "@/components/profile-edit/EditWorkingHours";
import EditDescriptions from "@/components/profile-edit/EditDescriptions";
import EditLocation from "@/components/profile-edit/EditLocation";
import EditSocialMedia from "@/components/profile-edit/EditSocialMedia";
import EditAvailability from "@/components/profile-edit/EditAvailability";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Briefcase, Clock, MapPin, Globe, FileText, Image as ImageIcon, UserCheck } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchGallery();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setLoading(false);

    if (error && error.code !== 'PGRST116') {
      toast.error("Greška pri učitavanju profila");
    } else {
      setProfile(data);
    }
  };

  const fetchGallery = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('profile_id', user.id)
      .order('display_order');

    if (data) {
      setGalleryImages(data);
    }
  };

  const handleProfileImageUpload = async (url: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ profile_image_url: url })
      .eq('id', user.id);

    if (error) {
      toast.error("Greška pri ažuriranju profilne slike");
    } else {
      fetchProfile();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">Nemate profil. Kreirajte ga sada!</p>
                <Button className="bg-hero-gradient" onClick={() => navigate("/registracija")}>
                  Kreiraj profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Uređivanje profila
            </h1>
            {profile.slug && (
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate(`/profil/${profile.slug}`)}>
                Pogledaj javni profil
              </Button>
            )}
          </div>

          {!profile.registration_completed && (
            <Card className="border-accent bg-accent/10">
              <CardContent className="pt-6">
                <p className="text-sm mb-2">Vaš profil nije potpun. Dovršite registraciju da biste postali vidljivi u pretragama.</p>
                <Button size="sm" className="bg-hero-gradient" onClick={() => navigate("/registracija")}>
                  Dovrši profil
                </Button>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="w-full h-auto grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 p-1">
              <TabsTrigger value="personal" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Lični</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Poslovni</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Usluge</span>
              </TabsTrigger>
              <TabsTrigger value="hours" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Radno vrijeme</span>
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Dostupnost</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Lokacija</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Društvene mreže</span>
              </TabsTrigger>
              <TabsTrigger value="descriptions" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Opisi</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center justify-center gap-1 text-xs sm:text-sm py-2">
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Slike</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Lični podaci</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditPersonalData profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Poslovni podaci</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditBusinessData profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Usluge koje nudite</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditServices profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hours">
              <Card>
                <CardHeader>
                  <CardTitle>Radno vrijeme</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditWorkingHours profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Dostupnost za nove klijente</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditAvailability profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Dostupnost i lokacija</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditLocation profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Društvene mreže</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditSocialMedia profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="descriptions">
              <Card>
                <CardHeader>
                  <CardTitle>Opisi i iskustvo</CardTitle>
                </CardHeader>
                <CardContent>
                  <EditDescriptions profile={profile} onUpdate={fetchProfile} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle>Slike i galerija</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ImageUpload
                    bucket="profile-images"
                    path={user.id}
                    currentImageUrl={profile.profile_image_url}
                    onUploadComplete={handleProfileImageUpload}
                    label="Profilna slika / Logo"
                  />

                  <GalleryUpload
                    profileId={user.id}
                    maxImages={5}
                    currentImages={galleryImages}
                    onUploadComplete={fetchGallery}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
