import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Activity } from "lucide-react";

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function Analysis() {
  const { data: defects = [], isLoading } = useQuery({
    queryKey: ['defects'],
    queryFn: () => base44.entities.Defect.list('-created_date', 200),
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => base44.entities.Inspection.list('-created_date', 200),
  });

  // Defect type distribution
  const defectTypeData = React.useMemo(() => {
    const counts = {};
    defects.forEach(d => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type: type.replace(/_/g, ' '),
      count
    }));
  }, [defects]);

  // Severity distribution
  const severityData = React.useMemo(() => {
    const counts = { critical: 0, major: 0, minor: 0 };
    defects.forEach(d => {
      counts[d.severity] = (counts[d.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([severity, count]) => ({
      severity,
      count
    }));
  }, [defects]);

  // Quality trends
  const qualityTrends = React.useMemo(() => {
    return inspections.slice(0, 20).reverse().map((inspection, index) => ({
      inspection: index + 1,
      score: inspection.quality_score || 0
    }));
  }, [inspections]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="w-12 h-12 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Defect Analysis</h1>
        <p className="text-slate-600">Comprehensive quality metrics and trend analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Defects</p>
                <h3 className="text-3xl font-bold text-slate-900">{defects.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Avg Confidence</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {defects.length > 0 
                    ? (defects.reduce((sum, d) => sum + (d.confidence || 0), 0) / defects.length).toFixed(1)
                    : 0}%
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Critical Defects</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {defects.filter(d => d.severity === 'critical').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Defect Types Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defectTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="type" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: '11px' }}
                />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ severity, count }) => `${severity}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">Quality Score Trends</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="inspection" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} style={{ fontSize: '12px' }} />
              <Tooltip />
              <Bar dataKey="score" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Critical Defects */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Critical Defects</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {defects.filter(d => d.severity === 'critical').slice(0, 5).map((defect) => (
              <div key={defect.id} className="p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{defect.type.replace(/_/g, ' ').toUpperCase()}</h4>
                    <p className="text-sm text-slate-600 mt-1">{defect.description}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    {defect.severity}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Confidence: {defect.confidence}%</span>
                  <span>•</span>
                  <span>{new Date(defect.created_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}