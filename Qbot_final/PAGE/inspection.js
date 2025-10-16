import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, Save, AlertCircle } from "lucide-react";
import ImageUploader from "../components/inspection/ImageUploader";
import DefectResults from "../components/inspection/DefectResults";

export default function Inspection() {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = React.useState(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [formData, setFormData] = React.useState({
    batch_number: "",
    equipment_id: "",
    station: "",
    operator: ""
  });

  const saveInspectionMutation = useMutation({
    mutationFn: async (data) => {
      const inspection = await base44.entities.Inspection.create(data.inspection);
      if (data.defects && data.defects.length > 0) {
        const defectsWithInspectionId = data.defects.map(d => ({
          ...d,
          inspection_id: inspection.id
        }));
        await base44.entities.Defect.bulkCreate(defectsWithInspectionId);
      }
      return inspection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      alert("Inspection saved successfully!");
      handleClear();
    }
  });

  const handleAnalyze = async () => {
    if (!imageUrl) {
      setError("Please upload an image first");
      return;
    }

    setError(null);
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this manufacturing inspection image for quality defects. 
        Look for surface scratches, dents, discoloration, cracks, contamination, dimensional errors, incomplete assembly, burrs, voids, misalignment, or other defects.
        
        For each defect found, provide:
        - type (use one of: surface_scratch, dent, discoloration, crack, contamination, dimensional_error, incomplete_assembly, burr, void, misalignment, other)
        - severity (critical, major, or minor)
        - confidence (0-100)
        - description (detailed explanation)
        - root_cause (potential cause)
        - corrective_action (recommended fix)
        
        Also calculate an overall quality_score (0-100) where 100 is perfect.
        
        Return the results as a JSON object with:
        {
          "quality_score": number,
          "defects": array of defect objects (can be empty array if no defects found)
        }`,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
            quality_score: { type: "number" },
            defects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { 
                    type: "string"
                  },
                  severity: { 
                    type: "string"
                  },
                  confidence: { type: "number" },
                  description: { type: "string" },
                  root_cause: { type: "string" },
                  corrective_action: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResults(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Analysis failed. Please make sure you uploaded a valid image (PNG, JPEG, WEBP, or GIF) and try again.");
    }
    setAnalyzing(false);
  };

  const handleSave = () => {
    if (!imageUrl || !results) {
      setError("Please complete an inspection first");
      return;
    }

    if (!formData.batch_number || !formData.equipment_id) {
      setError("Please fill in batch number and equipment ID");
      return;
    }

    setError(null);
    const inspectionData = {
      ...formData,
      status: "completed",
      quality_score: results.quality_score,
      defect_count: results.defects?.length || 0,
      image_url: imageUrl
    };

    const defectsData = results.defects || [];

    saveInspectionMutation.mutate({
      inspection: inspectionData,
      defects: defectsData
    });
  };

  const handleClear = () => {
    setImageUrl(null);
    setResults(null);
    setError(null);
    setFormData({
      batch_number: "",
      equipment_id: "",
      station: "",
      operator: ""
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quality Inspection</h1>
        <p className="text-slate-600">Upload and analyze product images for defect detection</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Inspection Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">Inspection Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="batch">Batch Number</Label>
              <Input
                id="batch"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                placeholder="e.g., B-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="equipment">Equipment ID</Label>
              <Input
                id="equipment"
                value={formData.equipment_id}
                onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
                placeholder="e.g., LINE-A1"
              />
            </div>
            <div>
              <Label htmlFor="station">Station</Label>
              <Input
                id="station"
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                placeholder="e.g., Final QC"
              />
            </div>
            <div>
              <Label htmlFor="operator">Operator</Label>
              <Input
                id="operator"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <ImageUploader
        onImageUploaded={setImageUrl}
        currentImage={imageUrl}
        onClear={handleClear}
      />

      {/* Action Buttons */}
      {imageUrl && (
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            size="lg"
            className="bg-slate-900 hover:bg-slate-800"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Analyze Image
              </>
            )}
          </Button>

          {results && (
            <Button
              onClick={handleSave}
              disabled={saveInspectionMutation.isPending}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {saveInspectionMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Inspection
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <DefectResults
          defects={results.defects}
          qualityScore={results.quality_score}
        />
      )}
    </div>
  );
}