import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, Wrench } from "lucide-react";

export default function EquipmentStatus({ equipment }) {
  const statusConfig = {
    operational: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, iconColor: "text-green-600" },
    maintenance: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Wrench, iconColor: "text-yellow-600" },
    offline: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Activity, iconColor: "text-gray-600" },
    error: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle, iconColor: "text-red-600" }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-semibold text-slate-900">Equipment Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {equipment.map((item) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;
            
            return (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-white hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className={`w-4 h-4 ${config.iconColor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.location}</p>
                    </div>
                  </div>
                  <Badge className={config.color} variant="secondary">
                    {item.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Uptime: {item.uptime}%</span>
                  <span>Inspections: {item.inspections}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}