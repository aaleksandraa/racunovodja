import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserCheck, UserX } from "lucide-react";

interface EditAvailabilityProps {
  profile: any;
  onUpdate: () => void;
}

const EditAvailability = ({ profile, onUpdate }: EditAvailabilityProps) => {
  const [loading, setLoading] = useState(false);
  const [acceptingClients, setAcceptingClients] = useState(
    profile.accepting_new_clients ?? true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ accepting_new_clients: acceptingClients })
      .eq("id", profile.id);

    setLoading(false);

    if (error) {
      toast.error("Greška pri ažuriranju dostupnosti");
    } else {
      toast.success("Dostupnost uspješno ažurirana");
      onUpdate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className={acceptingClients ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {acceptingClients ? (
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="space-y-1">
                <Label htmlFor="accepting-clients" className="text-base font-semibold cursor-pointer">
                  {acceptingClients ? "Primate nove klijente" : "Ne primate nove klijente"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {acceptingClients
                    ? "Vaš profil je označen kao dostupan za nove klijente. Potencijalni klijenti će znati da imate kapacitet za nove projekte."
                    : "Vaš profil je označen kao nedostupan za nove klijente. Korisnici će znati da trenutno nemate kapacitet za nove projekte."}
                </p>
              </div>
            </div>
            <Switch
              id="accepting-clients"
              checked={acceptingClients}
              onCheckedChange={setAcceptingClients}
              className="flex-shrink-0"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Napomena:</strong> Ova opcija ne utiče na vidljivost vašeg profila u pretragama. 
          Ona samo informiše posjetioce da li trenutno primate nove klijente ili ste popunjeni.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sačuvaj promjene
      </Button>
    </form>
  );
};

export default EditAvailability;
