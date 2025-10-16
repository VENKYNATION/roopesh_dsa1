import React from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Shield, Database, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const [userData, setUserData] = React.useState({
    full_name: "",
    email: ""
  });

  React.useEffect(() => {
    if (user) {
      setUserData({
        full_name: user.full_name || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await base44.auth.updateMe({ full_name: userData.full_name });
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userData.full_name}
                onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user?.role || ""}
                disabled
                className="bg-slate-50"
              />
            </div>
            <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Bell className="w-4 h-4 mr-2" />
              Notification Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="w-4 h-4 mr-2" />
              Data Management
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold text-slate-900">System Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Version</p>
              <p className="font-semibold text-slate-900">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Last Update</p>
              <p className="font-semibold text-slate-900">2024-01-15</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">System Status</p>
              <p className="font-semibold text-green-600">Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}