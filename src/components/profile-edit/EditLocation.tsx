import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditLocationProps {
  profile: any;
  onUpdate: () => void;
}

const EditLocation = ({ profile, onUpdate }: EditLocationProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    works_online: profile.works_online || false,
    has_physical_office: profile.has_physical_office || false,
    works_locally_only: profile.works_locally_only || false,
    google_maps_url: profile.google_maps_url || '',
    latitude: profile.latitude || '',
    longitude: profile.longitude || '',
  });

  const extractCoordinates = (url: string) => {
    try {
      const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        return { lat: match[1], lng: match[2] };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleGoogleMapsUrlChange = (url: string) => {
    setFormData({ ...formData, google_maps_url: url });
    
    if (url) {
      const coords = extractCoordinates(url);
      if (coords) {
        setFormData({
          ...formData,
          google_maps_url: url,
          latitude: coords.lat,
          longitude: coords.lng,
        });
        toast.success("Koordinate automatski izvučene iz URL-a");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        works_online: formData.works_online,
        has_physical_office: formData.has_physical_office,
        works_locally_only: formData.works_locally_only,
        google_maps_url: formData.google_maps_url.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      })
      .eq('id', profile.id);

    setLoading(false);

    if (error) {
      toast.error("Greška pri ažuriranju lokacije");
    } else {
      toast.success("Lokacija uspješno ažurirana");
      onUpdate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="works_online"
            checked={formData.works_online}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, works_online: checked as boolean })
            }
          />
          <Label htmlFor="works_online" className="cursor-pointer">
            Radim online
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="has_physical_office"
            checked={formData.has_physical_office}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, has_physical_office: checked as boolean })
            }
          />
          <Label htmlFor="has_physical_office" className="cursor-pointer">
            Imam fizičku kancelariju
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="works_locally_only"
            checked={formData.works_locally_only}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, works_locally_only: checked as boolean })
            }
          />
          <Label htmlFor="works_locally_only" className="cursor-pointer">
            Radim samo lokalno (u svom gradu/regiji)
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="google_maps_url">Google Maps URL</Label>
        <Input
          id="google_maps_url"
          type="url"
          placeholder="https://maps.app.goo.gl/..."
          value={formData.google_maps_url}
          onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          Zalijepite link sa Google Maps-a. Koordinate će biti automatski izvučene.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Geografska širina (Latitude)</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="43.8563"
            value={formData.latitude}
            onChange={(e) =>
              setFormData({ ...formData, latitude: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Geografska dužina (Longitude)</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="18.4131"
            value={formData.longitude}
            onChange={(e) =>
              setFormData({ ...formData, longitude: e.target.value })
            }
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sačuvaj lokaciju
      </Button>
    </form>
  );
};

export default EditLocation;
