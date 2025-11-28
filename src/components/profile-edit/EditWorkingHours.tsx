import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditWorkingHoursProps {
  profile: any;
  onUpdate: () => void;
}

const DAYS = [
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
  'Nedjelja',
];

const EditWorkingHours = ({ profile, onUpdate }: EditWorkingHoursProps) => {
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState<any[]>([]);

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    const { data } = await supabase
      .from('working_hours')
      .select('*')
      .eq('profile_id', profile.id)
      .order('day_of_week');

    if (data && data.length > 0) {
      // Sort to display Monday first
      const sortedData = [...data].sort((a, b) => {
        const dayA = a.day_of_week === 0 ? 6 : a.day_of_week - 1;
        const dayB = b.day_of_week === 0 ? 6 : b.day_of_week - 1;
        return dayA - dayB;
      });
      setHours(sortedData);
    } else {
      // Initialize with default values (1 = Monday, 2 = Tuesday, ..., 0 = Sunday)
      const dayValues = [1, 2, 3, 4, 5, 6, 0];
      setHours(
        DAYS.map((_, index) => ({
          day_of_week: dayValues[index],
          start_time: '09:00',
          end_time: '17:00',
          is_closed: index >= 5, // Weekend closed by default
        }))
      );
    }
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setHours(newHours);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Delete existing hours
    await supabase
      .from('working_hours')
      .delete()
      .eq('profile_id', profile.id);

    // Insert new hours
    const { error } = await supabase
      .from('working_hours')
      .insert(
        hours.map((hour) => ({
          profile_id: profile.id,
          day_of_week: hour.day_of_week,
          start_time: hour.is_closed ? null : hour.start_time,
          end_time: hour.is_closed ? null : hour.end_time,
          is_closed: hour.is_closed,
        }))
      );

    setLoading(false);

    if (error) {
      toast.error("Greška pri ažuriranju radnog vremena");
    } else {
      toast.success("Radno vrijeme uspješno ažurirano");
      onUpdate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hours.map((hour, index) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold">{DAYS[index]}</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`closed-${index}`}
                checked={hour.is_closed}
                onCheckedChange={(checked) =>
                  handleChange(index, 'is_closed', checked)
                }
              />
              <Label htmlFor={`closed-${index}`} className="cursor-pointer">
                Neradni dan
              </Label>
            </div>
          </div>

          {!hour.is_closed && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`start-${index}`}>Od</Label>
                <Input
                  id={`start-${index}`}
                  type="time"
                  value={hour.start_time}
                  onChange={(e) =>
                    handleChange(index, 'start_time', e.target.value)
                  }
                  step="3600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`end-${index}`}>Do</Label>
                <Input
                  id={`end-${index}`}
                  type="time"
                  value={hour.end_time}
                  onChange={(e) =>
                    handleChange(index, 'end_time', e.target.value)
                  }
                  step="3600"
                  required
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sačuvaj radno vrijeme
      </Button>
    </form>
  );
};

export default EditWorkingHours;
