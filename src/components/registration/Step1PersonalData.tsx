import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Step1Props {
  data: any;
  onChange: (data: any) => void;
}

const Step1PersonalData = ({ data, onChange }: Step1Props) => {
  const [entities, setEntities] = useState<any[]>([]);
  const [cantons, setCantons] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    if (data.personal_entity) {
      fetchCantons(data.personal_entity);
    }
  }, [data.personal_entity]);

  useEffect(() => {
    if (data.personal_entity) {
      fetchCities(data.personal_entity, data.personal_canton);
    }
  }, [data.personal_entity, data.personal_canton]);

  const fetchEntities = async () => {
    const { data: entitiesData } = await supabase.from('entities').select('*');
    if (entitiesData) setEntities(entitiesData);
  };

  const fetchCantons = async (entityId: string) => {
    const { data: cantonsData } = await supabase
      .from('cantons')
      .select('*')
      .eq('entity_id', entityId);
    if (cantonsData) setCantons(cantonsData);
  };

  const fetchCities = async (entityId: string, cantonId?: string) => {
    let query = supabase.from('cities').select('*').eq('entity_id', entityId);
    if (cantonId) {
      query = query.eq('canton_id', cantonId);
    }
    const { data: citiesData } = await query;
    if (citiesData) setCities(citiesData);
  };

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ime *</Label>
          <Input
            id="firstName"
            value={data.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Prezime *</Label>
          <Input
            id="lastName"
            value={data.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            disabled
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+387 XX XXX XXX"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Lična adresa</h3>
        
        <div className="space-y-2">
          <Label htmlFor="personalStreet">Ulica i broj *</Label>
          <Input
            id="personalStreet"
            value={data.personal_street || ''}
            onChange={(e) => handleChange('personal_street', e.target.value)}
            required
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="personalEntity">Entitet *</Label>
            <Select value={data.personal_entity} onValueChange={(value) => handleChange('personal_entity', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberite" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.personal_entity && cantons.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="personalCanton">Kanton/Opština</Label>
              <Select value={data.personal_canton} onValueChange={(value) => handleChange('personal_canton', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberite" />
                </SelectTrigger>
                <SelectContent>
                  {cantons.map((canton) => (
                    <SelectItem key={canton.id} value={canton.id}>
                      {canton.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="personalCity">Grad *</Label>
            <Select value={data.personal_city_id} onValueChange={(value) => handleChange('personal_city_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberite" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} ({city.postal_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1PersonalData;
