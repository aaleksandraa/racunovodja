import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Mail, Phone, Globe, ExternalLink, UserCheck, UserX, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface ProfileCardProps {
  profile: any;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const { data: settings } = useSiteSettings();
  const verificationMode = settings?.verification_display_mode || 'colored';
  
  const licenseTitle = (profile as any).license_type === 'certified_accountant' 
    ? 'Certifikovani računovođa' 
    : 'Certifikovani računovodstveni tehničar';
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in h-full flex flex-col border-border/50">
      <CardHeader className="pb-6 space-y-4">
        <div className="flex items-start gap-5">
          {profile.profile_image_url ? (
            <img 
              src={profile.profile_image_url} 
              alt={profile.company_name || `${profile.first_name} ${profile.last_name}`}
              className="h-20 w-20 rounded-lg object-cover flex-shrink-0 border border-border"
            />
          ) : (
            <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-xl font-bold leading-tight">
                {profile.company_name || `${profile.first_name} ${profile.last_name}`}
              </h3>
              {verificationMode === 'checkmark' && (profile as any).is_license_verified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-background border border-border z-50">
                      <p className="text-sm">Verifikovana licenca - {licenseTitle}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {/* License Title */}
            {(profile as any).license_type && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className={`text-sm font-medium mb-1 cursor-help ${
                      verificationMode === 'colored'
                        ? ((profile as any).is_license_verified 
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400')
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {licenseTitle}
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
          </div>
        </div>

        {profile.short_description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {profile.short_description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-5 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2">
          {(profile as any).accepting_new_clients !== false && (
            <Badge variant="secondary" className="text-xs px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <UserCheck className="h-3 w-3 mr-1" />
              Dostupan
            </Badge>
          )}
          {(profile as any).accepting_new_clients === false && (
            <Badge variant="secondary" className="text-xs px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
              <UserX className="h-3 w-3 mr-1" />
              Nedostupan
            </Badge>
          )}
          {profile.works_online && (
            <Badge variant="secondary" className="text-xs px-3 py-1">Online</Badge>
          )}
          {profile.has_physical_office && (
            <Badge variant="secondary" className="text-xs px-3 py-1">Fizička kancelarija</Badge>
          )}
          {profile.years_experience > 0 && (
            <Badge variant="outline" className="text-xs px-3 py-1">{profile.years_experience} god. iskustva</Badge>
          )}
        </div>

        <div className="space-y-3 text-sm flex-1">
          {profile.phone && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">{profile.phone}</span>
            </div>
          )}
          {profile.email && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">{profile.email}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate font-medium transition-colors">
                Web stranica
              </a>
            </div>
          )}
        </div>

        <Link to={`/profil/${profile.slug}`} className="mt-auto">
          <Button className="w-full font-semibold" variant="outline" size="lg">
            Pogledaj profil <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
