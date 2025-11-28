import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Facebook, Instagram } from "lucide-react";

interface Step6Props {
  data: any;
  onChange: (data: any) => void;
}

const Step6SocialMedia = ({ data, onChange }: Step6Props) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Društvene mreže</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Povežite vaše profile na društvenim mrežama (opcionalno)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-primary" />
            LinkedIn profil
          </Label>
          <Input
            id="linkedin"
            type="url"
            value={data.linkedin_url || ''}
            onChange={(e) => handleChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/vas-profil"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4 text-primary" />
            Facebook stranica
          </Label>
          <Input
            id="facebook"
            type="url"
            value={data.facebook_url || ''}
            onChange={(e) => handleChange('facebook_url', e.target.value)}
            placeholder="https://facebook.com/vasa-stranica"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4 text-primary" />
            Instagram profil
          </Label>
          <Input
            id="instagram"
            type="url"
            value={data.instagram_url || ''}
            onChange={(e) => handleChange('instagram_url', e.target.value)}
            placeholder="https://instagram.com/vas-profil"
          />
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 Tip: Dodavanje linkova prema društvenim mrežama povećava povjerenje kod potencijalnih klijenata i olakšava im kontakt.
        </p>
      </div>
    </div>
  );
};

export default Step6SocialMedia;
