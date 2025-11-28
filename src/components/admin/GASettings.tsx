import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const GASettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gaId, setGaId] = useState('');
  const [showAvailabilityFilter, setShowAvailabilityFilter] = useState(false);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [requireAdminApproval, setRequireAdminApproval] = useState(false);
  const [showVerifiedFilter, setShowVerifiedFilter] = useState(false);
  const [verificationDisplayMode, setVerificationDisplayMode] = useState('colored');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('google_analytics_id, show_availability_filter, show_map_search, require_admin_approval, show_verified_filter, verification_display_mode')
        .single();

      if (error) throw error;

      setGaId(data?.google_analytics_id || '');
      setShowAvailabilityFilter(data?.show_availability_filter || false);
      setShowMapSearch(data?.show_map_search || false);
      setRequireAdminApproval(data?.require_admin_approval || false);
      setShowVerifiedFilter(data?.show_verified_filter || false);
      setVerificationDisplayMode(data?.verification_display_mode || 'colored');
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Greška pri učitavanju postavki');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          google_analytics_id: gaId || null,
          show_availability_filter: showAvailabilityFilter,
          show_map_search: showMapSearch,
          require_admin_approval: requireAdminApproval,
          show_verified_filter: showVerifiedFilter,
          verification_display_mode: verificationDisplayMode
        })
        .eq('id', (await supabase.from('site_settings').select('id').single()).data?.id);

      if (error) throw error;

      toast.success('Postavke sačuvane');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Greška pri čuvanju postavki');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Analytics</CardTitle>
          <CardDescription>
            Podesite Google Analytics tracking ID za praćenje posjeta sajtu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga-id">Google Analytics ID</Label>
            <Input
              id="ga-id"
              placeholder="G-XXXXXXXXXX ili UA-XXXXXXXXX-X"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Unesite vaš Google Analytics Measurement ID (npr. G-XXXXXXXXXX)
            </p>
          </div>

          <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
            <p><strong>Kako dobiti Google Analytics ID:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Idite na <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics</a></li>
              <li>Kreirajte nalog ili se prijavite</li>
              <li>Dodajte novu Property</li>
              <li>Kopirajte Measurement ID (G-XXXXXXXXXX)</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filteri pretrage</CardTitle>
          <CardDescription>
            Kontrolišite koje filtere korisnici vide na stranici pretrage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="show-availability"
              checked={showAvailabilityFilter}
              onCheckedChange={(checked) => setShowAvailabilityFilter(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="show-availability" className="cursor-pointer font-medium">
                Prikaži filter "Samo dostupni za nove klijente"
              </Label>
              <p className="text-sm text-muted-foreground">
                Omogućava korisnicima da filtriraju rezultate pretrage i vide samo knjigovođe koji trenutno primaju nove klijente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mapa na početnoj stranici</CardTitle>
          <CardDescription>
            Kontrolišite funkcionalnosti mape profesionalaca u blizini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="show-map-search"
              checked={showMapSearch}
              onCheckedChange={(checked) => setShowMapSearch(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="show-map-search" className="cursor-pointer font-medium">
                Prikaži pretragu po imenu na mapi
              </Label>
              <p className="text-sm text-muted-foreground">
                Omogućava korisnicima da pretražuju profesionalce po imenu direktno na mapi u realnom vremenu
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Odobravanje profila</CardTitle>
          <CardDescription>
            Kontrolišite da li admin mora odobriti profile prije nego što postanu javno vidljivi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="require-admin-approval"
              checked={requireAdminApproval}
              onCheckedChange={(checked) => setRequireAdminApproval(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="require-admin-approval" className="cursor-pointer font-medium">
                Admin odobrava profile
              </Label>
              <p className="text-sm text-muted-foreground">
                Kada je uključeno, novi profili će biti neaktivni dok admin ne odobri svaki profil pojedinačno. Korisno kada želite kontrolu nad tim ko se prikazuje na platformi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filter verifikovanih profesionalaca</CardTitle>
          <CardDescription>
            Omogućite korisnicima da filtriraju samo verifikovane profesionalce
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="show-verified-filter"
              checked={showVerifiedFilter}
              onCheckedChange={(checked) => setShowVerifiedFilter(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="show-verified-filter" className="cursor-pointer font-medium">
                Prikaži filter za verifikovane profesionalce
              </Label>
              <p className="text-sm text-muted-foreground">
                Kada je uključeno, korisnici mogu filtrirati rezultate pretrage da vide samo profesionalce sa verifikovanim licencama.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prikaz verifikacije licence</CardTitle>
          <CardDescription>
            Odaberite kako će se prikazivati verifikovane licence profesionalaca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={verificationDisplayMode} onValueChange={setVerificationDisplayMode}>
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="colored" id="colored" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="colored" className="cursor-pointer font-medium">
                  Obojena verifikacija (Plava boja)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Verifikovane licence se prikazuju u plavoj boji za isticanje
                </p>
                <div className="mt-3 p-3 bg-background rounded border">
                  <p className="text-sm font-medium mb-1">Primer:</p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    Certifikovani računovođa ✓
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="checkmark" id="checkmark" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="checkmark" className="cursor-pointer font-medium">
                  Diskretni checkmark (Siva boja + ikona)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Verifikovane licence ostaju u sivoj boji sa malim checkmark-om pored imena (kao Facebook/Instagram)
                </p>
                <div className="mt-3 p-3 bg-background rounded border">
                  <p className="text-sm font-medium mb-1">Primer:</p>
                  <div className="flex items-center gap-1">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Ime Prezime
                    </p>
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Čuvam...
          </>
        ) : (
          'Sačuvaj sve postavke'
        )}
      </Button>
    </div>
  );
};
