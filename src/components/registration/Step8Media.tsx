import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface Step8Props {
  data: any;
  onChange: (data: any) => void;
}

const Step8Media = ({ data, onChange }: Step8Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Profilna slika i galerija</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Dodajte vizuelne elemente koji će predstaviti vas ili vašu firmu
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Profilna slika / Logo</Label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload funkcionalnost biće dostupna nakon završetka registracije
            </p>
            <p className="text-xs text-muted-foreground">
              Preporučeno: kvadratna slika, min. 400x400px
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Galerija (do 5 slika)</Label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Dodajte slike radnog prostora, kancelarije ili tima
            </p>
            <p className="text-xs text-muted-foreground">
              Upload funkcionalnost biće dostupna nakon završetka registracije
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-accent rounded-lg">
        <p className="text-sm font-medium mb-2">💡 Zašto je ovo važno?</p>
        <p className="text-sm text-muted-foreground">
          Profili sa slikama dobijaju 3x više pregleda i kontakata. Vizuelni sadržaj pomaže klijentima da steknu povjerenje.
        </p>
      </div>
    </div>
  );
};

export default Step8Media;
