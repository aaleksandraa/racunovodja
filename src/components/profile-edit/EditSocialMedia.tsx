import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditSocialMediaProps {
  profile: any;
  onUpdate: () => void;
}

const EditSocialMedia = ({ profile, onUpdate }: EditSocialMediaProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    linkedin_url: profile.linkedin_url || '',
    facebook_url: profile.facebook_url || '',
    instagram_url: profile.instagram_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        linkedin_url: formData.linkedin_url.trim(),
        facebook_url: formData.facebook_url.trim(),
        instagram_url: formData.instagram_url.trim(),
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      toast.error("Greška pri ažuriranju društvenih mreža");
    } else {
      toast.success("Društvene mreže uspješno ažurirane");
      onUpdate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn profil</Label>
        <Input
          id="linkedin_url"
          type="url"
          placeholder="https://www.linkedin.com/in/..."
          value={formData.linkedin_url}
          onChange={(e) =>
            setFormData({ ...formData, linkedin_url: e.target.value })
          }
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="facebook_url">Facebook stranica</Label>
        <Input
          id="facebook_url"
          type="url"
          placeholder="https://www.facebook.com/..."
          value={formData.facebook_url}
          onChange={(e) =>
            setFormData({ ...formData, facebook_url: e.target.value })
          }
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagram_url">Instagram profil</Label>
        <Input
          id="instagram_url"
          type="url"
          placeholder="https://www.instagram.com/..."
          value={formData.instagram_url}
          onChange={(e) =>
            setFormData({ ...formData, instagram_url: e.target.value })
          }
          maxLength={500}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sačuvaj društvene mreže
      </Button>
    </form>
  );
};

export default EditSocialMedia;
