import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, Loader2 } from 'lucide-react';

export const CSVImport = () => {
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const downloadTemplate = () => {
    const template = `name,postal_code,entity_code,canton_name
Sarajevo,71000,fbih,Sarajevski kanton
Banja Luka,78000,rs,
Tuzla,75000,fbih,Tuzlanski kanton`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradovi_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Template preuzet');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Molimo odaberite fajl');
      return;
    }

    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const cities = results.data as any[];
          
          for (const city of cities) {
            // Get entity_id
            let entityId = null;
            if (city.entity_code) {
              const { data: entityData } = await supabase
                .from('entities')
                .select('id')
                .eq('code', city.entity_code.toLowerCase())
                .single();
              
              if (entityData) entityId = entityData.id;
            }

            // Get canton_id if provided
            let cantonId = null;
            if (city.canton_name && entityId) {
              const { data: cantonData } = await supabase
                .from('cantons')
                .select('id')
                .eq('name', city.canton_name)
                .eq('entity_id', entityId)
                .single();
              
              if (cantonData) cantonId = cantonData.id;
            }

            // Insert city
            const { error } = await supabase
              .from('cities')
              .insert({
                name: city.name,
                postal_code: city.postal_code,
                entity_id: entityId,
                canton_id: cantonId
              });

            if (error && error.code !== '23505') { // Ignore duplicate errors
              console.error('Error inserting city:', city.name, error);
            }
          }

          toast.success(`Uspješno importovano ${cities.length} gradova`);
          setFile(null);
          
          // Reset file input
          const fileInput = document.getElementById('csv-file') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Greška pri importu');
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        console.error('Parse error:', error);
        toast.error('Greška pri čitanju CSV fajla');
        setImporting(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import gradova iz CSV</CardTitle>
        <CardDescription>
          Preuzmite template, popunite podatke i učitajte CSV fajl
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Preuzmi Template
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV Fajl</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importing}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Odabran fajl: {file.name}
            </p>
          )}
        </div>

        <Button onClick={handleImport} disabled={!file || importing}>
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importujem...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Importuj
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Napomena:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>entity_code: fbih, rs, ili brcko</li>
            <li>canton_name: Opciono, samo za FBiH</li>
            <li>Postojeći gradovi se preskačuju</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
