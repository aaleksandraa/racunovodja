import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface Step5Props {
  data: any;
  onChange: (data: any) => void;
}

const Step5Location = ({ data, onChange }: Step5Props) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const extractCoordinatesFromUrl = () => {
    const url = data.google_maps_url;
    if (!url) {
      toast.error("Unesite Google Maps URL");
      return;
    }

    try {
      // Extract coordinates from various Google Maps URL formats
      let lat, lng;
      
      // Format: @lat,lng,zoom
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
      }
      
      // Format: q=lat,lng
      const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (!atMatch && qMatch) {
        lat = parseFloat(qMatch[1]);
        lng = parseFloat(qMatch[2]);
      }

      if (lat && lng) {
        handleChange('latitude', lat);
        handleChange('longitude', lng);
        toast.success("Koordinate uspješno učitane!");
      } else {
        toast.error("Nije moguće učitati koordinate iz URL-a. Unesite ih ručno.");
      }
    } catch (error) {
      toast.error("Greška pri učitavanju koordinata");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Dostupnost i lokacija</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Odredite kako i gdje ste dostupni za rad sa klijentima
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="worksOnline"
            checked={data.works_online || false}
            onCheckedChange={(checked) => handleChange('works_online', checked)}
          />
          <Label htmlFor="worksOnline" className="cursor-pointer">
            Radim online (putem interneta)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasPhysicalOffice"
            checked={data.has_physical_office || false}
            onCheckedChange={(checked) => handleChange('has_physical_office', checked)}
          />
          <Label htmlFor="hasPhysicalOffice" className="cursor-pointer">
            Imam fizičku kancelariju
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="worksLocally"
            checked={data.works_locally_only || false}
            onCheckedChange={(checked) => handleChange('works_locally_only', checked)}
          />
          <Label htmlFor="worksLocally" className="cursor-pointer">
            Radim samo u svojoj regiji
          </Label>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-semibold">Lokacija na mapi</h4>
        
        <div className="space-y-2">
          <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
          <div className="flex gap-2">
            <Input
              id="googleMapsUrl"
              type="url"
              value={data.google_maps_url || ''}
              onChange={(e) => handleChange('google_maps_url', e.target.value)}
              placeholder="https://maps.google.com/..."
            />
            <Button type="button" onClick={extractCoordinatesFromUrl} variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Učitaj
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Unesite link sa Google Maps i kliknite "Učitaj" za automatsko učitavanje koordinata
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude (Geografska širina)</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              value={data.latitude || ''}
              onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
              placeholder="43.856430"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (Geografska dužina)</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              value={data.longitude || ''}
              onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
              placeholder="18.413029"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Location;
