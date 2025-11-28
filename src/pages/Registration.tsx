import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

import Step1PersonalData from "@/components/registration/Step1PersonalData";
import Step2BusinessData from "@/components/registration/Step2BusinessData";
import Step3Services from "@/components/registration/Step3Services";
import Step4WorkingHours from "@/components/registration/Step4WorkingHours";
import Step5Location from "@/components/registration/Step5Location";
import Step6SocialMedia from "@/components/registration/Step6SocialMedia";
import Step7References from "@/components/registration/Step7References";
import Step8Media from "@/components/registration/Step8Media";
import Step9Descriptions from "@/components/registration/Step9Descriptions";

const STEPS = [
  { number: 1, title: "Privatni podaci", component: Step1PersonalData },
  { number: 2, title: "Poslovni podaci", component: Step2BusinessData },
  { number: 3, title: "Usluge", component: Step3Services },
  { number: 4, title: "Radno vrijeme", component: Step4WorkingHours },
  { number: 5, title: "Lokacija", component: Step5Location },
  { number: 6, title: "Društvene mreže", component: Step6SocialMedia },
  { number: 7, title: "Reference", component: Step7References },
  { number: 8, title: "Media", component: Step8Media },
  { number: 9, title: "Opisi", component: Step9Descriptions },
];

const Registration = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth?mode=register");
      return;
    }
    setUser(session.user);
    setFormData({ ...formData, email: session.user.email });
    
    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.registration_completed) {
      navigate("/dashboard");
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateCurrentStep = () => {
    const step = currentStep;
    
    if (step === 1) {
      if (!formData.first_name || !formData.last_name || !formData.phone || !formData.personal_street || !formData.personal_city_id) {
        toast.error("Molimo popunite sva obavezna polja");
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.license_type || !formData.license_number) {
        toast.error("Molimo popunite podatke o licenci");
        return false;
      }
      if (formData.business_type) {
        if (!formData.business_street || !formData.business_city_id) {
          toast.error("Molimo popunite poslovnu adresu");
          return false;
        }
      }
    }
    
    if (step === 9) {
      if (!formData.short_description || !formData.long_description) {
        toast.error("Molimo popunite oba opisa");
        return false;
      }
      if (formData.long_description.length < 100) {
        toast.error("Detaljni opis mora imati najmanje 100 karaktera");
        return false;
      }
      if (!formData.terms_accepted) {
        toast.error("Morate prihvatiti uslove korišćenja kako biste nastavili");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !user) return;
    
    setIsLoading(true);
    
    try {
      // Check if admin approval is required
      const { data: settings } = await supabase
        .from('site_settings')
        .select('require_admin_approval')
        .single();

      const requireApproval = settings?.require_admin_approval || false;
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          personal_street: formData.personal_street,
          personal_city_id: formData.personal_city_id,
          license_type: formData.license_type,
          license_number: formData.license_number,
          business_type: formData.business_type,
          company_name: formData.company_name,
          website: formData.website,
          tax_id: formData.tax_id,
          business_street: formData.business_street,
          business_city_id: formData.business_city_id,
          years_experience: formData.years_experience || 0,
          short_description: formData.short_description,
          long_description: formData.long_description,
          works_online: formData.works_online || false,
          has_physical_office: formData.has_physical_office || false,
          works_locally_only: formData.works_locally_only || false,
          latitude: formData.latitude,
          longitude: formData.longitude,
          google_maps_url: formData.google_maps_url,
          linkedin_url: formData.linkedin_url,
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url,
          professional_organizations: formData.professional_organizations,
          registration_completed: true,
          is_active: !requireApproval, // Set inactive if admin approval is required
        });

      if (profileError) throw profileError;

      // Insert services
      if (formData.services && formData.services.length > 0) {
        const serviceRecords = formData.services.map((serviceId: string) => ({
          profile_id: user.id,
          service_id: serviceId,
        }));
        
        await supabase.from('profile_services').delete().eq('profile_id', user.id);
        const { error: servicesError } = await supabase
          .from('profile_services')
          .insert(serviceRecords);
        
        if (servicesError) throw servicesError;
      }

      // Insert working hours
      if (formData.working_hours) {
        const hoursRecords = Object.entries(formData.working_hours).map(([day, data]: [string, any]) => ({
          profile_id: user.id,
          day_of_week: parseInt(day),
          start_time: data.start_time,
          end_time: data.end_time,
          is_closed: data.is_closed || false,
        }));
        
        await supabase.from('working_hours').delete().eq('profile_id', user.id);
        const { error: hoursError } = await supabase
          .from('working_hours')
          .insert(hoursRecords);
        
        if (hoursError) throw hoursError;
      }

      // Insert references
      if (formData.references && formData.references.length > 0) {
        const referenceRecords = formData.references
          .filter((ref: any) => ref.client_name)
          .map((ref: any) => ({
            profile_id: user.id,
            client_name: ref.client_name,
            description: ref.description,
          }));
        
        if (referenceRecords.length > 0) {
          await supabase.from('client_references').delete().eq('profile_id', user.id);
          const { error: refsError } = await supabase
            .from('client_references')
            .insert(referenceRecords);
          
          if (refsError) throw refsError;
        }
      }

      toast.success(
        requireApproval 
          ? "Profil uspješno kreiran! Vaš profil čeka odobrenje administratora prije nego što postane javno vidljiv."
          : "Profil uspješno kreiran!"
      );
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Greška pri kreiranju profila: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <div className="container px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Registracija profila</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Korak {currentStep} od {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>

          <div className="mb-6 sm:mb-8">
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Steps sidebar - simplified on mobile, vertical on desktop */}
            <div className="lg:col-span-1">
              <div className="flex lg:flex-col gap-2">
                {isMobile ? (
                  // Mobile: Show only current and next step with arrow indicator
                  <>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground flex-1">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 flex-shrink-0">
                        <span className="text-sm font-semibold">{currentStep}</span>
                      </div>
                      <span className="text-sm font-medium">{STEPS[currentStep - 1].title}</span>
                    </div>
                    {currentStep < STEPS.length && (
                      <>
                        <div className="flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground flex-1">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 flex-shrink-0">
                            <span className="text-sm font-semibold">{currentStep + 1}</span>
                          </div>
                          <span className="text-sm font-medium">{STEPS[currentStep].title}</span>
                        </div>
                      </>
                    )}
                    {currentStep < STEPS.length - 1 && (
                      <div className="flex items-center justify-center flex-shrink-0">
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </>
                ) : (
                  // Desktop: Show all steps vertically
                  STEPS.map((step) => (
                    <div
                      key={step.number}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        step.number === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : step.number < currentStep
                          ? 'bg-success/10 text-success'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 flex-shrink-0">
                        {step.number < currentStep ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-semibold">{step.number}</span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">{STEPS[currentStep - 1].title}</CardTitle>
                  <CardDescription className="text-sm">
                    Popunite informacije za ovaj korak
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CurrentStepComponent data={formData} onChange={setFormData} />

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6 sm:mt-8 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Nazad
                    </Button>

                    {currentStep < STEPS.length ? (
                      <Button type="button" onClick={handleNext} className="bg-hero-gradient w-full sm:w-auto">
                        Dalje
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-success-gradient w-full sm:w-auto"
                      >
                        {isLoading ? "Kreiranje..." : "Završi registraciju"}
                        <Check className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
