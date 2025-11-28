import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Step7Props {
  data: any;
  onChange: (data: any) => void;
}

const Step7References = ({ data, onChange }: Step7Props) => {
  const references = data.references || [];

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addReference = () => {
    const newReferences = [...references, { client_name: '', description: '' }];
    handleChange('references', newReferences);
  };

  const removeReference = (index: number) => {
    const newReferences = references.filter((_: any, i: number) => i !== index);
    handleChange('references', newReferences);
  };

  const updateReference = (index: number, field: string, value: string) => {
    const newReferences = [...references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    handleChange('references', newReferences);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Reference i certifikati</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Povećajte kredibilitet dodavanjem referenci i informacija o vašem iskustvu
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsExperience">Godine iskustva</Label>
        <Input
          id="yearsExperience"
          type="number"
          min="0"
          value={data.years_experience || 0}
          onChange={(e) => handleChange('years_experience', parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="professionalOrgs">Članstvo u profesionalnim organizacijama</Label>
        <Textarea
          id="professionalOrgs"
          value={data.professional_organizations || ''}
          onChange={(e) => handleChange('professional_organizations', e.target.value)}
          placeholder="Npr: Komora ovlaštenih računovođa i revizora FBiH, Udruženje računovođa RS..."
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm sm:text-base">Lista klijenata i referenci</Label>
          <Button type="button" onClick={addReference} size="sm" variant="outline" className="whitespace-nowrap">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Dodaj referencu</span>
            <span className="sm:hidden">Dodaj</span>
          </Button>
        </div>

        {references.map((ref: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <Input
                  placeholder="Naziv klijenta ili projekta"
                  value={ref.client_name}
                  onChange={(e) => updateReference(index, 'client_name', e.target.value)}
                />
                <Textarea
                  placeholder="Opis saradnje (opcionalno)"
                  value={ref.description}
                  onChange={(e) => updateReference(index, 'description', e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeReference(index)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {references.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
            Dodajte reference kako bi klijenti vidjeli vaše prethodno iskustvo
          </div>
        )}
      </div>

      <div className="p-4 bg-accent rounded-lg">
        <p className="text-sm font-medium mb-2">📄 Certifikati</p>
        <p className="text-sm text-muted-foreground">
          Certifikate ćete moći uploadovati nakon završetka registracije u vašem profilu.
        </p>
      </div>
    </div>
  );
};

export default Step7References;
