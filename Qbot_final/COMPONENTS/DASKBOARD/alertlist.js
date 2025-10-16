import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlertsList({ alerts: initialAlerts }) {
  const [alerts, setAlerts] = React.useState(initialAlerts);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const severityConfig = {
    critical: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle, iconColor: "text-red-600" },
    major: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertTriangle, iconColor: "text-orange-600" },
    minor: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, iconColor: "text-yellow-600" },
    info: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle, iconColor: "text-blue-600" }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center justify-between">
          Recent Alerts
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className={`w-4 h-4 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-slate-900">{alert.title}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{alert.time}</span>
                        <span>•</span>
                        <span>{alert.location}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {alerts.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All clear!</p>
              <p className="text-sm">No active alerts at this time.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}