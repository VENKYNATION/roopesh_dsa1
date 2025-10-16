import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

export default function DefectResults({ defects, qualityScore }) {
  const severityColors = {
    critical: "bg-red-100 text-red-800 border-red-300",
    major: "bg-orange-100 text-orange-800 border-orange-300",
    minor: "bg-yellow-100 text-yellow-800 border-yellow-300"
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Detection Results</CardTitle>
          <Badge className={qualityScore >= 90 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
            Quality: {qualityScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {defects && defects.length > 0 ? (
          <div className="space-y-4">
            {defects.map((defect, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {defect.type.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">{defect.description}</p>
                    </div>
                  </div>
                  <Badge className={severityColors[defect.severity]} variant="secondary">
                    {defect.severity}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <span>Confidence: {defect.confidence}%</span>
                  {defect.root_cause && <span>Root Cause: {defect.root_cause}</span>}
                </div>
                
                {defect.corrective_action && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Recommended Action:</strong> {defect.corrective_action}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Defects Detected</h3>
            <p className="text-slate-600">Quality inspection passed successfully</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}