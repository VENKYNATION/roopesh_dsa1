import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Camera, Activity } from "lucide-react";

export default function History() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterEquipment, setFilterEquipment] = React.useState("");

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => base44.entities.Inspection.list('-created_date', 500),
  });

  const filteredInspections = React.useMemo(() => {
    return inspections.filter(inspection => {
      const matchesSearch = searchTerm === "" || 
        inspection.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.operator?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEquipment = filterEquipment === "" || 
        inspection.equipment_id?.toLowerCase().includes(filterEquipment.toLowerCase());

      return matchesSearch && matchesEquipment;
    });
  }, [inspections, searchTerm, filterEquipment]);

  const statusColors = {
    completed: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
    review_required: "bg-orange-100 text-orange-800"
  };

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Inspection History</h1>
        <p className="text-slate-600">View and analyze historical inspection records</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by batch number or operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Input
                placeholder="Filter by equipment..."
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {filteredInspections.length} of {inspections.length} inspections
        </p>
      </div>

      {/* Inspections Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">Inspection Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Defects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((inspection) => (
                  <TableRow key={inspection.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      {new Date(inspection.created_date).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-slate-500">
                        {new Date(inspection.created_date).toLocaleTimeString()}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{inspection.batch_number}</TableCell>
                    <TableCell>{inspection.equipment_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              inspection.quality_score >= 90
                                ? "bg-green-500"
                                : inspection.quality_score >= 80
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${inspection.quality_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{inspection.quality_score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{inspection.defect_count || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[inspection.status]} variant="secondary">
                        {inspection.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{inspection.operator || '-'}</TableCell>
                    <TableCell>
                      {inspection.image_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={inspection.image_url} target="_blank" rel="noopener noreferrer">
                            <Camera className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInspections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                      No inspections found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}