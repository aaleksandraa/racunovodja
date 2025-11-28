import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  bucket: string;
  path: string;
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
  label: string;
  maxFiles?: number;
}

const ImageUpload = ({
  bucket,
  path,
  currentImageUrl,
  onUploadComplete,
  label,
  maxFiles = 1,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Molimo odaberite sliku (JPG, PNG, WEBP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Slika je prevelika. Maksimalna veličina je 5MB");
        return;
      }

      setUploading(true);

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}-${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreview(publicUrl);
      toast.success("Slika uspješno učitana");
      await onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Greška pri uploadu slike");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <Label
            htmlFor={`upload-${bucket}-${path}`}
            className="cursor-pointer"
          >
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Kliknite da odaberete sliku
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ili WEBP (max 5MB)
              </p>
            </div>
          </Label>
          <input
            id={`upload-${bucket}-${path}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm">Učitavanje...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
