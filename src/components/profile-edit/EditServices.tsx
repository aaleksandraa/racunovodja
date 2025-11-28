import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditServicesProps {
  profile: any;
  onUpdate: () => void;
}

const EditServices = ({ profile, onUpdate }: EditServicesProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProfileServices();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });
    
    if (data) setCategories(data);
  };

  const fetchProfileServices = async () => {
    const { data } = await supabase
      .from('profile_services')
      .select('service_id')
      .eq('profile_id', profile.id);
    
    if (data) {
      setSelectedServices(data.map((s) => s.service_id));
    }
  };

  const handleToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length === 0) {
      toast.error("Morate odabrati barem jednu uslugu");
      return;
    }

    setLoading(true);

    // Delete existing services
    await supabase
      .from('profile_services')
      .delete()
      .eq('profile_id', profile.id);

    // Insert new services
    const { error } = await supabase
      .from('profile_services')
      .insert(
        selectedServices.map((service_id) => ({
          profile_id: profile.id,
          service_id,
        }))
      );

    setLoading(false);

    if (error) {
      toast.error("Greška pri ažuriranju usluga");
    } else {
      toast.success("Usluge uspješno ažurirane");
      onUpdate();
    }
  };

  const mainCategories = categories.filter((cat) => !cat.parent_id);
  const getSubcategories = (parentId: string) =>
    categories.filter((cat) => cat.parent_id === parentId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {mainCategories.map((mainCat) => {
          const subs = getSubcategories(mainCat.id);
          return (
            <div key={mainCat.id} className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id={mainCat.id}
                  checked={selectedServices.includes(mainCat.id)}
                  onCheckedChange={() => handleToggle(mainCat.id)}
                />
                <Label
                  htmlFor={mainCat.id}
                  className="text-base font-semibold cursor-pointer"
                >
                  {mainCat.name}
                </Label>
              </div>
              
              {subs.length > 0 && (
                <div className="ml-6 space-y-2">
                  {subs.map((subCat) => (
                    <div key={subCat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subCat.id}
                        checked={selectedServices.includes(subCat.id)}
                        onCheckedChange={() => handleToggle(subCat.id)}
                      />
                      <Label htmlFor={subCat.id} className="font-normal cursor-pointer">
                        {subCat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sačuvaj usluge
      </Button>
    </form>
  );
};

export default EditServices;
