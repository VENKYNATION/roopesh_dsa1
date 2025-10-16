import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, Plus, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Reports() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = React.useState(false);
  const [selectedReport, setSelectedReport] = React.useState(null);
  const [formData, setFormData] = React.useState({
    type: "daily_summary",
    date_from: "",
    date_to: ""
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => base44.entities.Inspection.list('-created_date', 500),
  });

  const { data: defects = [] } = useQuery({
    queryKey: ['defects'],
    queryFn: () => base44.entities.Defect.list('-created_date', 500),
  });

  const generateReport = async () => {
    if (!formData.date_from || !formData.date_to) {
      alert("Please select date range");
      return;
    }

    setGenerating(true);
    try {
      const dateFrom = new Date(formData.date_from);
      const dateTo = new Date(formData.date_to);
      
      const filteredInspections = inspections.filter(i => {
        const date = new Date(i.created_date);
        return date >= dateFrom && date <= dateTo;
      });

      const filteredDefects = defects.filter(d => {
        const date = new Date(d.created_date);
        return date >= dateFrom && date <= dateTo;
      });

      const avgQuality = filteredInspections.length > 0
        ? filteredInspections.reduce((sum, i) => sum + (i.quality_score || 0), 0) / filteredInspections.length
        : 0;

      const defectsByType = {};
      filteredDefects.forEach(d => {
        defectsByType[d.type] = (defectsByType[d.type] || 0) + 1;
      });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive quality inspection report for manufacturing operations.
        
        Report Type: ${formData.type.replace(/_/g, ' ')}
        Period: ${formData.date_from} to ${formData.date_to}
        
        Data Summary:
        - Total Inspections: ${filteredInspections.length}
        - Total Defects: ${filteredDefects.length}
        - Average Quality Score: ${avgQuality.toFixed(1)}%
        - Defects by Type: ${JSON.stringify(defectsByType)}
        - Critical Defects: ${filteredDefects.filter(d => d.severity === 'critical').length}
        - Major Defects: ${filteredDefects.filter(d => d.severity === 'major').length}
        - Minor Defects: ${filteredDefects.filter(d => d.severity === 'minor').length}
        
        Please create a professional report with:
        1. Executive Summary
        2. Key Findings
        3. Detailed Analysis
        4. Trends and Patterns
        5. Recommendations
        6. Action Items
        
        Format the report in markdown with clear sections and bullet points.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            content: { type: "string" }
          }
        }
      });

      const reportData = {
        title: `${formData.type.replace(/_/g, ' ')} Report - ${formData.date_from} to ${formData.date_to}`,
        type: formData.type,
        date_from: formData.date_from,
        date_to: formData.date_to,
        summary: result.summary,
        content: result.content,
        total_inspections: filteredInspections.length,
        total_defects: filteredDefects.length,
        average_quality_score: avgQuality,
        status: "completed"
      };

      await base44.entities.Report.create(reportData);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      alert("Report generated successfully!");
      
      setFormData({ type: "daily_summary", date_from: "", date_to: "" });
    } catch (error) {
      console.error("Report generation failed:", error);
      alert("Failed to generate report. Please try again.");
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quality Reports</h1>
        <p className="text-slate-600">Generate and view comprehensive quality analysis reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily_summary">Daily Summary</SelectItem>
                  <SelectItem value="weekly_quality">Weekly Quality</SelectItem>
                  <SelectItem value="monthly_analysis">Monthly Analysis</SelectItem>
                  <SelectItem value="defect_analysis">Defect Analysis</SelectItem>
                  <SelectItem value="equipment_performance">Equipment Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_from">From Date</Label>
              <Input
                id="date_from"
                type="date"
                value={formData.date_from}
                onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="date_to">To Date</Label>
              <Input
                id="date_to"
                type="date"
                value={formData.date_to}
                onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
              />
            </div>

            <Button
              onClick={generateReport}
              disabled={generating}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Generated Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600">No reports generated yet</p>
                <p className="text-sm text-slate-500 mt-1">Create your first report using the form</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{report.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{report.summary?.substring(0, 100)}...</p>
                      </div>
                      <Badge className="ml-4">
                        {report.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.created_date).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{report.total_inspections} inspections</span>
                      <span>•</span>
                      <span>{report.total_defects} defects</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Viewer */}
      {selectedReport && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">{selectedReport.title}</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <ReactMarkdown>{selectedReport.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}