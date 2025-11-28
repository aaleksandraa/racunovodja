import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProfileMap from "@/components/ProfileMap";
import { SEO } from "@/components/SEO";
import { ProfileStructuredData } from "@/components/ProfileStructuredData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  useProfile, 
  useProfileGallery, 
  useProfileServices, 
  useProfileReferences, 
  useProfileCertificates,
  useWorkingHours 
} from "@/hooks/useProfiles";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Briefcase,
  Award,
  Linkedin,
  Facebook,
  Instagram,
  Building2,
  Calendar,
  UserCheck,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { Loader2 } from "lucide-react";

const DAYS = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];

// Format time to remove seconds (HH:MM:SS -> HH:MM)
const formatTime = (time: string) => {
  if (!time) return '';
  return time.substring(0, 5);
};

const Profile = () => {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Use React Query hooks for efficient data fetching
  const { data: profile, isLoading: profileLoading } = useProfile(slug);
  const { data: settings } = useSiteSettings();
  const verificationMode = settings?.verification_display_mode || 'colored';
  const { data: gallery = [] } = useProfileGallery(profile?.id);
  const { data: servicesData = [] } = useProfileServices(profile?.id);
  const { data: references = [] } = useProfileReferences(profile?.id);
  const { data: certificates = [] } = useProfileCertificates(profile?.id);
  const { data: workingHours = [] } = useWorkingHours(profile?.id);

  // Extract services from the data structure
  const services = servicesData.map((item: any) => ({
    service_id: item.service_id,
    service_categories: item.service_categories
  }));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  if (profileLoading) {
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
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Profil nije pronađen</h1>
          <Link to="/">
            <Button>Nazad na početnu</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile.company_name || `${profile.first_name} ${profile.last_name}`;
  const licenseTitle = (profile as any).license_type === 'certified_accountant' 
    ? 'Certifikovani računovođa' 
    : 'Certifikovani računovodstveni tehničar';

  // Generate SEO content
  const seoTitle = displayName;
  const seoDescription = profile.short_description || 
    `${displayName} - ${profile.business_type === 'company' ? 'Računovodstvena firma' : 'Knjigovođa'} u ${profile.business_city?.name || 'Bosni i Hercegovini'}. ${profile.years_experience ? `${profile.years_experience} godina iskustva.` : ''} Kontaktirajte za profesionalne računovodstvene usluge.`;
  
  const seoKeywords = [
    displayName,
    'knjigovođa',
    'računovođa',
    profile.business_city?.name,
    profile.business_type === 'company' ? 'računovodstvena firma' : 'računovođa',
    'bosna i hercegovina',
    'bih',
    services.map(s => s.service_categories.name).join(', ')
  ].filter(Boolean).join(', ');

  // Group services by parent category
  const mainCategories = services
    .map(s => s.service_categories)
    .filter(cat => !cat.parent_id)
    .reduce((acc: any[], cat) => {
      if (!acc.find(c => c.id === cat.id)) acc.push(cat);
      return acc;
    }, []);

  const getSubcategories = (parentId: string) =>
    services
      .map(s => s.service_categories)
      .filter(cat => cat.parent_id === parentId);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/profil/${slug}`}
        type="profile"
        image={profile.profile_image_url}
      />
      <ProfileStructuredData 
        profile={profile}
        services={services}
        workingHours={workingHours}
      />
      <Header user={user} />

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-background to-muted/20">
        <div className="container px-4 py-6 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Layout */}
            <div className="sm:hidden">
              {/* Image with Name and Subtitle */}
              <div className="flex gap-3 mb-3">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {profile.profile_image_url ? (
                  <img 
                    src={profile.profile_image_url} 
                    alt={displayName}
                    className="h-24 w-24 rounded-lg object-cover shadow-lg border-2 border-border"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                )}
                </div>
                
                {/* Name and Description */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h1 className="text-lg font-bold leading-tight">{displayName}</h1>
                    {verificationMode === 'checkmark' && (profile as any).is_license_verified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border border-border z-50">
                            <p className="text-sm">Verifikovana licenca - {licenseTitle}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {/* License Title Mobile */}
                  {(profile as any).license_type && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className={`text-xs font-semibold mb-1 cursor-help ${
                            verificationMode === 'colored'
                              ? ((profile as any).is_license_verified 
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400')
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {(profile as any).license_type === 'certified_accountant' ? 'Certifikovani računovođa' : 'Certifikovani računovodstveni tehničar'}
                            {verificationMode === 'colored' && (profile as any).is_license_verified && ' ✓'}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background border border-border z-50">
                          <p className="text-sm">
                            {(profile as any).is_license_verified 
                              ? `Verifikovana licenca - ${licenseTitle}` 
                              : `Licenca u procesu verifikacije - ${licenseTitle}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {profile.short_description && (
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                      {profile.short_description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Badges Row */}
              <div className="flex items-center gap-3 mb-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {(profile as any).accepting_new_clients !== false && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Dostupan
                    </Badge>
                  )}
                  {(profile as any).accepting_new_clients === false && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      <UserX className="h-3 w-3 mr-1" />
                      Nedostupan
                    </Badge>
                  )}
                  {profile.has_physical_office && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <Building2 className="h-3 w-3 mr-1" />
                      Kancelarija
                    </Badge>
                  )}
                  {profile.years_experience > 0 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <Award className="h-3 w-3 mr-1" />
                      {profile.years_experience} god.
                    </Badge>
                  )}
                  {profile.works_online && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <Globe className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  )}
                </div>
                
              </div>
              
              {/* Second Row: Contact Buttons */}
              <div className="flex gap-2">
                {profile.email && (
                  <Button size="sm" className="flex-1" asChild>
                    <a href={`mailto:${profile.email}`}>
                      <Mail className="h-4 w-4 mr-1.5" />
                      Kontakt
                    </a>
                  </Button>
                )}
                {profile.phone && (
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={`tel:${profile.phone}`}>
                      <Phone className="h-4 w-4 mr-1.5" />
                      Pozovi
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Layout - 3 Column */}
            <div className="hidden sm:grid sm:grid-cols-[auto_1fr_auto] gap-6 items-start">
            {/* Column 1: Profile Image */}
            <div className="flex-shrink-0">
              {profile.profile_image_url ? (
                <img 
                  src={profile.profile_image_url} 
                  alt={displayName}
                  className="h-40 w-40 rounded-lg object-cover shadow-lg border-2 border-border"
                />
              ) : (
                <div className="h-40 w-40 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-lg">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
              )}
            </div>
              
                <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{displayName}</h1>
                    {verificationMode === 'checkmark' && (profile as any).is_license_verified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border border-border z-50">
                            <p className="text-sm">Verifikovana licenca - {licenseTitle}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {/* License Title Desktop */}
                  {(profile as any).license_type && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className={`text-base font-semibold mb-2 cursor-help ${
                            verificationMode === 'colored'
                              ? ((profile as any).is_license_verified 
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400')
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {(profile as any).license_type === 'certified_accountant' ? 'Certifikovani računovođa' : 'Certifikovani računovodstveni tehničar'}
                            {verificationMode === 'colored' && (profile as any).is_license_verified && ' ✓'}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background border border-border z-50">
                          <p className="text-sm">
                            {(profile as any).is_license_verified 
                              ? `Verifikovana licenca - ${licenseTitle}` 
                              : `Licenca u procesu verifikacije - ${licenseTitle}`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {profile.short_description && (
                    <p className="text-base md:text-lg text-muted-foreground">
                      {profile.short_description}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(profile as any).accepting_new_clients !== false && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <UserCheck className="h-3 w-3 mr-1.5" />
                      Dostupan za nove klijente
                    </Badge>
                  )}
                  {(profile as any).accepting_new_clients === false && (
                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      <UserX className="h-3 w-3 mr-1.5" />
                      Nedostupan za nove klijente
                    </Badge>
                  )}
                  {profile.works_online && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="h-3 w-3 mr-1.5" />
                      Online
                    </Badge>
                  )}
                  {profile.has_physical_office && (
                    <Badge variant="secondary" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1.5" />
                      Fizička kancelarija
                    </Badge>
                  )}
                  {profile.years_experience > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Award className="h-3 w-3 mr-1.5" />
                      {profile.years_experience} god. iskustva
                    </Badge>
                  )}
                </div>
              </div>

              {/* Column 3: Contact Buttons */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                {profile.email && (
                  <Button size="sm" className="w-full" asChild>
                    <a href={`mailto:${profile.email}`}>
                      <Mail className="h-4 w-4 mr-1.5" />
                      Kontakt
                    </a>
                  </Button>
                )}
                {profile.phone && (
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <a href={`tel:${profile.phone}`}>
                      <Phone className="h-4 w-4 mr-1.5" />
                      Pozovi
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 py-8 md:py-12 max-w-full overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* About */}
              {profile.long_description && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {profile.long_description}
                    </p>
                  </CardContent>
                </Card>
              )}
              {/* Contact Info Card */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Kontakt
                  </h2>
                  
                  <div className="space-y-3">
                    {profile.email && (
                      <a
                        href={`mailto:${profile.email}`}
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{profile.email}</span>
                      </a>
                    )}
                    
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </a>
                    )}
                    
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                      >
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">Web stranica</span>
                      </a>
                    )}

                    {(profile.business_street || profile.business_city) && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">
                          {profile.business_street}
                          {profile.business_city && `, ${profile.business_city.name}`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              {services.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Usluge
                    </h2>
                    
                    <div className="space-y-4">
                      {mainCategories.map((mainCat: any) => {
                        const subs = getSubcategories(mainCat.id);
                        
                        return (
                          <div key={mainCat.id}>
                            <h3 className="font-medium text-sm mb-2">{mainCat.name}</h3>
                            {subs.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {subs.map((sub: any) => (
                                  <Badge key={sub.id} variant="secondary" className="text-xs font-normal">
                                    {sub.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Map */}
              {(profile.latitude && profile.longitude) && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      Lokacija
                    </h2>
                    
                    <ProfileMap
                      latitude={profile.latitude}
                      longitude={profile.longitude}
                      name={displayName}
                      googleMapsUrl={profile.google_maps_url}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Gallery */}
              {gallery.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Galerija</h2>
                    <div className="grid grid-cols-3 gap-2">
                      {gallery.map((image: any) => (
                        <div
                          key={image.id}
                          className="aspect-square rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(image.image_url)}
                        >
                          <img
                            src={image.image_url}
                            alt="Gallery"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Image Lightbox */}
              <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0">
                  <img 
                    src={selectedImage || ''} 
                    alt="Gallery" 
                    className="w-full h-auto max-h-[90vh] object-contain"
                  />
                </DialogContent>
              </Dialog>

              {/* References */}
              {references.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-primary" />
                      Reference
                    </h2>
                    
                    <div className="space-y-3">
                      {references.map((ref: any) => (
                        <div key={ref.id} className="p-3 bg-muted/30 rounded-lg">
                          <h3 className="font-medium text-sm mb-1">{ref.client_name}</h3>
                          {ref.description && (
                            <p className="text-xs text-muted-foreground">{ref.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Working Hours */}
              {workingHours.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      Radno vrijeme
                    </h2>
                    
                    <div className="space-y-2">
                      {workingHours
                        .sort((a: any, b: any) => {
                          const dayA = a.day_of_week === 0 ? 6 : a.day_of_week - 1;
                          const dayB = b.day_of_week === 0 ? 6 : b.day_of_week - 1;
                          return dayA - dayB;
                        })
                        .map((hour: any) => {
                          const dayIndex = hour.day_of_week === 0 ? 6 : hour.day_of_week - 1;
                          return (
                            <div key={hour.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{DAYS[dayIndex]}</span>
                              <span className="font-medium">
                                {hour.is_closed ? 'Zatvoreno' : `${formatTime(hour.start_time)} - ${formatTime(hour.end_time)}`}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Media */}
              {(profile.linkedin_url || profile.facebook_url || profile.instagram_url) && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Društvene mreže</h2>
                    <div className="flex gap-3">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {profile.facebook_url && (
                        <a
                          href={profile.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {profile.instagram_url && (
                        <a
                          href={profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
