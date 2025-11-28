import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step2Props {
  data: any;
  onChange: (data: any) => void;
}

const Step2BusinessData = ({ data, onChange }: Step2Props) => {
  const [entities, setEntities] = useState<any[]>([]);
  const [cantons, setCantons] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [openCityCombobox, setOpenCityCombobox] = useState(false);

  useEffect(() => {
    fetchEntities();
  }, []);

  useEffect(() => {
    if (data.business_entity) {
      fetchCantons(data.business_entity);
    }
  }, [data.business_entity]);

  useEffect(() => {
    if (data.business_entity) {
      fetchCities(data.business_entity, data.business_canton);
    }
  }, [data.business_entity, data.business_canton]);

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
      <div className="space-y-4">
        <Label>Licenca *</Label>
        <RadioGroup value={data.license_type} onValueChange={(value) => handleChange('license_type', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="certified_accountant" id="certified_accountant" />
            <Label htmlFor="certified_accountant">Certifikovani računovođa</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="certified_accounting_technician" id="certified_accounting_technician" />
            <Label htmlFor="certified_accounting_technician">Certifikovani računovodstveni tehničar</Label>
          </div>
        </RadioGroup>
      </div>

      {data.license_type && (
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">Broj licence *</Label>
          <Input
            id="licenseNumber"
            value={data.license_number || ''}
            onChange={(e) => handleChange('license_number', e.target.value)}
            placeholder="Unesite broj licence"
          />
        </div>
      )}

      <div className="space-y-4">
        <Label>Tip poslovanja *</Label>
        <RadioGroup value={data.business_type} onValueChange={(value) => handleChange('business_type', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual">Samostalno poslujem</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company">Poslujem kroz firmu</Label>
          </div>
        </RadioGroup>
      </div>

      {data.business_type && (
        <>
          <div className="space-y-2">
            <Label htmlFor="companyName">
              {data.business_type === 'company' ? 'Naziv firme *' : 'Naziv pod kojim poslujete'}
            </Label>
            <Input
              id="companyName"
              value={data.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Web stranica</Label>
              <Input
                id="website"
                type="url"
                value={data.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://primjer.ba"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxId">JIB/PDV broj</Label>
              <Input
                id="taxId"
                value={data.tax_id || ''}
                onChange={(e) => handleChange('tax_id', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Poslovna adresa</h3>
            
            <div className="space-y-2">
              <Label htmlFor="businessStreet">Ulica i broj *</Label>
              <Input
                id="businessStreet"
                value={data.business_street || ''}
                onChange={(e) => handleChange('business_street', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessEntity">Entitet *</Label>
                <Select value={data.business_entity} onValueChange={(value) => handleChange('business_entity', value)}>
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

              {data.business_entity && cantons.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="businessCanton">Kanton/Opština</Label>
                  <Select value={data.business_canton} onValueChange={(value) => handleChange('business_canton', value)}>
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
                <Label htmlFor="businessCity">Grad *</Label>
                <Popover open={openCityCombobox} onOpenChange={setOpenCityCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCityCombobox}
                      className="w-full justify-between"
                    >
                      {data.business_city_id
                        ? cities.find((city) => city.id === data.business_city_id)?.name +
                          " (" + cities.find((city) => city.id === data.business_city_id)?.postal_code + ")"
                        : "Pretražite grad ili poštanski broj..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Pretražite grad ili poštanski broj..." />
                      <CommandList>
                        <CommandEmpty>Grad nije pronađen.</CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city.id}
                              value={`${city.name} ${city.postal_code}`}
                              onSelect={() => {
                                handleChange('business_city_id', city.id);
                                setOpenCityCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.business_city_id === city.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city.name} ({city.postal_code})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Step2BusinessData;
