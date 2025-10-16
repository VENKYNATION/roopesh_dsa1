import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Zap, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Predictions() {
  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => base44.entities.Inspection.list('-created_date', 100),
  });

  const { data: defects = [] } = useQuery({
    queryKey: ['defects'],
    queryFn: () => base44.entities.Defect.list('-created_date', 100),
  });

  // Calculate risk scores and predictions
  const recentQualityScore = inspections.length > 0 
    ? inspections.slice(0, 10).reduce((sum, i) => sum + (i.quality_score || 0), 0) / Math.min(10, inspections.length)
    : 0;

  const defectRate = inspections.length > 0 ? (defects.length / inspections.length) * 100 : 0;
  const criticalDefectRate = inspections.length > 0 
    ? (defects.filter(d => d.severity === 'critical').length / inspections.length) * 100 
    : 0;

  // Risk prediction data
  const riskTrend = inspections.slice(0, 20).reverse().map((inspection, index) => ({
    time: index + 1,
    risk: 100 - (inspection.quality_score || 0),
    quality: inspection.quality_score || 0
  }));

  // Risk level determination
  const overallRisk = recentQualityScore < 80 ? 'high' : recentQualityScore < 90 ? 'medium' : 'low';
  const riskColor = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    low: 'bg-green-100 text-green-800 border-green-300'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Predictive Analytics</h1>
        <p className="text-slate-600">AI-powered quality predictions and risk assessment</p>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Overall Risk Level</p>
                <Badge className={`${riskColor[overallRisk]} text-lg px-3 py-1`}>
                  {overallRisk.toUpperCase()}
                </Badge>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-600">Based on recent quality trends</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Defect Rate</p>
                <h3 className="text-3xl font-bold text-slate-900">{defectRate.toFixed(1)}%</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-600">Defects per inspection</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Quality Trend</p>
                <h3 className="text-3xl font-bold text-slate-900">{recentQualityScore.toFixed(1)}%</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-600">Last 10 inspections avg</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Critical Rate</p>
                <h3 className="text-3xl font-bold text-slate-900">{criticalDefectRate.toFixed(1)}%</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-slate-600">Critical defects detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">Risk & Quality Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={riskTrend}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="risk"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorRisk)"
                name="Risk Score"
              />
              <Area
                type="monotone"
                dataKey="quality"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorQuality)"
                name="Quality Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Predictions & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Upcoming Risks</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {overallRisk !== 'low' && (
                <div className="p-4 rounded-lg border-l-4 border-orange-500 bg-orange-50">
                  <h4 className="font-semibold text-orange-900 mb-2">Quality Degradation Risk</h4>
                  <p className="text-sm text-orange-800">
                    Recent quality scores show a declining trend. Recommended to review process parameters and conduct equipment inspection.
                  </p>
                </div>
              )}
              
              {criticalDefectRate > 1 && (
                <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                  <h4 className="font-semibold text-red-900 mb-2">High Critical Defect Rate</h4>
                  <p className="text-sm text-red-800">
                    Critical defect rate is elevated. Immediate review of production line required.
                  </p>
                </div>
              )}

              {defectRate > 10 && (
                <div className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50">
                  <h4 className="font-semibold text-yellow-900 mb-2">Increased Defect Frequency</h4>
                  <p className="text-sm text-yellow-800">
                    Overall defect rate is above threshold. Consider process optimization and operator training.
                  </p>
                </div>
              )}

              {overallRisk === 'low' && criticalDefectRate < 1 && defectRate < 10 && (
                <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-semibold text-green-900 mb-2">Optimal Performance</h4>
                  <p className="text-sm text-green-800">
                    Quality metrics are within acceptable range. Continue current practices and monitor for any changes.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm">Process Parameter Review</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    Analyze temperature, pressure, and speed settings for optimization opportunities
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm">Equipment Calibration</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    Schedule calibration check for inspection equipment to ensure accuracy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm">Operator Training</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    Conduct refresher training on quality standards and inspection procedures
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 text-sm">Root Cause Analysis</h5>
                  <p className="text-xs text-slate-600 mt-1">
                    Investigate recurring defect patterns to identify systematic issues
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}