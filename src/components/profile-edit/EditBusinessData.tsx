import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditBusinessDataProps {
  profile: any;
  onUpdate: () => void;
}

const EditBusinessData = ({ profile, onUpdate }: EditBusinessDataProps) => {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    business_type: profile.business_type || 'individual',
    company_name: profile.company_name || '',
    website: profile.website || '',
    tax_id: profile.tax_id || '',
    business_street: profile.business_street || '',
    business_city_id: profile.business_city_id || '',
    license_type: profile.license_type || '',
    license_number: profile.license_number || '',
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    const { data } = await supabase
      .from('cities')
      .select('id, name, postal_code')
      .order('name');
    
    if (data) setCities(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        business_type: formData.business_type,
        company_name: formData.company_name.trim(),
        website: formData.website.trim(),
        tax_id: formData.tax_id.trim(),
        business_street: formData.business_street.trim(),
        business_city_id: formData.business_city_id || null,
        license_type: formData.license_type || null,
        license_number: formData.license_number.trim() || null,
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      toast.error("Greška pri ažuriranju podataka");
    } else {
      toast.success("Poslovni podaci uspješno ažurirani");
      onUpdate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Licenca</Label>
        <RadioGroup
          value={formData.license_type}
          onValueChange={(value) => setFormData({ ...formData, license_type: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="certified_accountant" id="cert-accountant" />
            <Label htmlFor="cert-accountant" className="font-normal cursor-pointer">
              Certifikovani računovođa
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="certified_accounting_technician" id="cert-tech" />
            <Label htmlFor="cert-tech" className="font-normal cursor-pointer">
              Certifikovani računovodstveni tehničar
            </Label>
          </div>
        </RadioGroup>
      </div>

      {formData.license_type && (
        <div className="space-y-2">
          <Label htmlFor="license_number">Broj licence</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            placeholder="Unesite broj licence"
            maxLength={100}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Tip poslovanja *</Label>
        <RadioGroup
          value={formData.business_type}
          onValueChange={(value) => setFormData({ ...formData, business_type: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="font-normal cursor-pointer">
              Samostalno poslujem
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company" className="font-normal cursor-pointer">
              Poslujem kroz firmu
            </Label>
          </div>
        </RadioGroup>
      </div>

      {formData.business_type === 'company' && (
        <div className="space-y-2">
          <Label htmlFor="company_name">Naziv firme *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required={formData.business_type === 'company'}
            maxLength={200}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Web stranica</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://..."
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_id">JIB / PDV broj</Label>
          <Input
            id="tax_id"
            value={formData.tax_id}
            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
            maxLength={50}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_street">Poslovna adresa - Ulica i broj</Label>
        <Input
          id="business_street"
          value={formData.business_street}
          onChange={(e) => setFormData({ ...formData, business_street: e.target.value })}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_city">Poslovna adresa - Grad</Label>
        <Select
          value={formData.business_city_id}
          onValueChange={(value) => setFormData({ ...formData, business_city_id: value })}
        >
          <SelectTrigger id="business_city">
            <SelectValue placeholder="Odaberite grad" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.postal_code} - {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sačuvaj promjene
      </Button>
    </form>
  );
};

export default EditBusinessData;
