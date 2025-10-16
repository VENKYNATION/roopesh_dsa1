import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImageUploader({ onImageUploaded, currentImage, onClear }) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, JPEG, WEBP, or GIF image file.');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onImageUploaded(file_url);
    } catch (error) {
      console.error("Upload failed:", error);
      setError('Failed to upload image. Please try again.');
    }
    setUploading(false);
  };

  return (
    <Card className="border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors">
      <CardContent className="p-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!currentImage ? (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Inspection Image</h3>
            <p className="text-sm text-slate-600 mb-2">
              Drag and drop or click to select an image for quality inspection
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Supported formats: PNG, JPEG, WEBP, GIF (max 20MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Select Image"}
            </Button>
          </div>
        ) : (
          <div className="relative">
            <img
              src={currentImage}
              alt="Inspection"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 shadow-lg"
              onClick={onClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}