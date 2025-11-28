import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GalleryUploadProps {
  profileId: string;
  maxImages?: number;
  currentImages?: Array<{ id: string; image_url: string; display_order: number }>;
  onUploadComplete: () => void;
}

const GalleryUpload = ({
  profileId,
  maxImages = 5,
  currentImages = [],
  onUploadComplete,
}: GalleryUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(currentImages);

  // Update local images when currentImages prop changes
  useEffect(() => {
    setImages(currentImages);
  }, [currentImages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      if (images.length + files.length > maxImages) {
        toast.error(`Možete dodati maksimalno ${maxImages} slika`);
        return;
      }

      setUploading(true);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error("Molimo odaberite slike (JPG, PNG, WEBP)");
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Slika je prevelika. Maksimalna veličina je 5MB");
          continue;
        }

        // Create unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${profileId}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `${profileId}/${fileName}`;

        // Upload file
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
          .from('gallery_images')
          .insert({
            profile_id: profileId,
            image_url: publicUrl,
            display_order: images.length + i,
          });

        if (dbError) throw dbError;
      }

      toast.success("Slike uspješno učitane");
      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Greška pri uploadu slika");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      setImages(images.filter(img => img.id !== imageId));
      toast.success("Slika obrisana");
      onUploadComplete();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error("Greška pri brisanju slike");
    }
  };

  return (
    <div className="space-y-4">
      <Label>Galerija (do {maxImages} slika)</Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.image_url}
              alt="Gallery"
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(image.id, image.image_url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {images.length < maxImages && (
          <div className="border-2 border-dashed rounded-lg p-4 text-center bg-muted/30 flex flex-col items-center justify-center h-32">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <Label
              htmlFor="gallery-upload"
              className="cursor-pointer text-xs text-muted-foreground"
            >
              Dodaj slike
            </Label>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {uploading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm">Učitavanje...</span>
        </div>
      )}
    </div>
  );
};

export default GalleryUpload;
