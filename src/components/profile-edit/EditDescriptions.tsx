import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditDescriptionsProps {
  profile: any;
  onUpdate: () => void;
}

const EditDescriptions = ({ profile, onUpdate }: EditDescriptionsProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    short_description: profile.short_description || '',
    long_description: profile.long_description || '',
    years_experience: profile.years_experience || 0,
    professional_organizations: profile.professional_organizations || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        short_description: formData.short_description.trim(),
        long_description: formData.long_description.trim(),
        years_experience: formData.years_experience,
        professional_organizations: formData.professional_organizations.trim(),
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      toast.error("Greška pri ažuriranju opisa");
    } else {
      toast.success("Opisi uspješno ažurirani");
      onUpdate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="short_description">Kratki opis (jedna rečenica)</Label>
        <Input
          id="short_description"
          value={formData.short_description}
          onChange={(e) =>
            setFormData({ ...formData, short_description: e.target.value })
          }
          maxLength={200}
          placeholder="Npr: Certificirani računovođa sa 10 godina iskustva"
        />
        <p className="text-xs text-muted-foreground">
          Ovaj tekst se prikazuje u pretragama i kao podnaslov na profilu
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="long_description">Dugi opis</Label>
        <Textarea
          id="long_description"
          value={formData.long_description}
          onChange={(e) =>
            setFormData({ ...formData, long_description: e.target.value })
          }
          rows={10}
          maxLength={5000}
          placeholder="Detaljno predstavite sebe, svoje usluge, iskustvo..."
        />
        <p className="text-xs text-muted-foreground">
          Opišite svoje usluge, iskustvo, pristup radu...
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="years_experience">Godine iskustva</Label>
          <Input
            id="years_experience"
            type="number"
            min="0"
            max="99"
            value={formData.years_experience}
            onChange={(e) =>
              setFormData({ ...formData, years_experience: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="professional_organizations">
            Članstvo u organizacijama
          </Label>
          <Input
            id="professional_organizations"
            value={formData.professional_organizations}
            onChange={(e) =>
              setFormData({
                ...formData,
                professional_organizations: e.target.value,
              })
            }
            maxLength={200}
            placeholder="Npr: Komora certificiranih računovođa"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sačuvaj opise
      </Button>
    </form>
  );
};

export default EditDescriptions;
