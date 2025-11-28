import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Step3Props {
  data: any;
  onChange: (data: any) => void;
}

const Step3Services = ({ data, onChange }: Step3Props) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data: categoriesData } = await supabase
      .from('service_categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    
    if (categoriesData) {
      setCategories(categoriesData);
      
      for (const category of categoriesData) {
        const { data: subsData } = await supabase
          .from('service_categories')
          .select('*')
          .eq('parent_id', category.id)
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });
        
        if (subsData) {
          setSubcategories(prev => ({ ...prev, [category.id]: subsData }));
        }
      }
    }
  };

  const handleToggleService = (serviceId: string) => {
    const currentServices = data.services || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((id: string) => id !== serviceId)
      : [...currentServices, serviceId];
    
    onChange({ ...data, services: newServices });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Odaberite usluge koje nudite</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Možete odabrati više usluga. Ovo će pomoći klijentima da vas pronađu.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={category.id}
              checked={data.services?.includes(category.id)}
              onCheckedChange={() => handleToggleService(category.id)}
            />
            <Label htmlFor={category.id} className="font-semibold text-base cursor-pointer">
              {category.name}
            </Label>
          </div>
          
          {category.description && (
            <p className="text-sm text-muted-foreground ml-6">
              {category.description}
            </p>
          )}

          {subcategories[category.id] && subcategories[category.id].length > 0 && (
            <div className="ml-6 space-y-3">
              {subcategories[category.id].map((sub) => (
                <div key={sub.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={sub.id}
                    checked={data.services?.includes(sub.id)}
                    onCheckedChange={() => handleToggleService(sub.id)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={sub.id} className="cursor-pointer">
                      {sub.name}
                    </Label>
                    {sub.description && (
                      <p className="text-xs text-muted-foreground">
                        {sub.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Step3Services;
