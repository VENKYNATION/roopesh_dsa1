import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Camera, AlertTriangle, CheckCircle, TrendingUp, Activity } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import QualityChart from "../components/dashboard/QualityChart";
import AlertsList from "../components/dashboard/AlertsList";
import EquipmentStatus from "../components/dashboard/EquipmentStatus";

export default function Dashboard() {
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => base44.entities.Inspection.list('-created_date', 100),
  });

  const { data: defects = [] } = useQuery({
    queryKey: ['defects'],
    queryFn: () => base44.entities.Defect.list('-created_date', 100),
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date'),
  });

  // Calculate metrics
  const totalInspections = inspections.length;
  const totalDefects = defects.length;
  const avgQualityScore = inspections.length > 0
    ? (inspections.reduce((sum, i) => sum + (i.quality_score || 0), 0) / inspections.length).toFixed(1)
    : 0;
  const activeEquipment = equipment.filter(e => e.status === 'operational').length;

  // Generate chart data
  const chartData = inspections.slice(0, 24).reverse().map((inspection, index) => ({
    time: new Date(inspection.created_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    score: inspection.quality_score || 0
  }));

  // Generate alerts
  const recentDefects = defects.slice(0, 10);
  const alerts = recentDefects.map((defect, index) => ({
    id: defect.id,
    title: `${defect.type.replace(/_/g, ' ')} Detected`,
    message: defect.description || `${defect.severity} defect found`,
    severity: defect.severity === 'critical' ? 'critical' : defect.severity === 'major' ? 'major' : 'minor',
    time: new Date(defect.created_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    location: `Inspection ${defect.inspection_id.substring(0, 8)}`
  }));

  const equipmentStatus = equipment.map(eq => ({
    id: eq.id,
    name: eq.name,
    location: eq.location,
    status: eq.status,
    uptime: eq.uptime_percentage || 95,
    inspections: eq.total_inspections || 0
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 animate-spin text-slate-600" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Quality Dashboard</h1>
        <p className="text-slate-600">Real-time manufacturing quality monitoring and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inspections"
          value={totalInspections}
          subtitle="Last 24 hours"
          icon={Camera}
          trend="+12.5%"
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="Quality Score"
          value={`${avgQualityScore}%`}
          subtitle="Average score"
          icon={CheckCircle}
          trend="+3.2%"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="Defects Detected"
          value={totalDefects}
          subtitle="Requires attention"
          icon={AlertTriangle}
          trend="-8.1%"
          trendUp={true}
          color="orange"
        />
        <StatCard
          title="Active Equipment"
          value={`${activeEquipment}/${equipment.length}`}
          subtitle="Operational status"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QualityChart data={chartData} title="Quality Score Trend (24h)" />
        </div>
        <div>
          <AlertsList alerts={alerts} />
        </div>
      </div>

      {/* Equipment Status */}
      <EquipmentStatus equipment={equipmentStatus} />
    </div>
  );
}