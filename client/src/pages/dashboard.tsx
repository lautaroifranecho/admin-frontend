import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, Upload, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import FileImportModal from "@/components/FileImportModal";
import ExportModal from "@/components/ExportModal";
import UserTable from "@/components/UserTable";
import Layout from "@/components/Layout";
import RecentUpdateModal from "@/components/RecentUpdateModal";
import { useToast } from "@/hooks/use-toast";


export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { signOut, token, isAuthenticated, isLoading } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const { data: stats } = useQuery<{
    totalUsers: number;
    confirmed: number;
    updated: number;
    pending: number;
    confirmationRate: number;
    todayUpdates: number;
    recentUpdateCount: number;
  }>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: !!token && isAuthenticated,
  });

  const { data: recentUpdates } = useQuery<{ users: any[]; total: number }>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users?limit=5", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch recent updates");
      return response.json();
    },
    enabled: !!token && isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleLogout = () => {
    signOut();
    setLocation("/login");
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
        const response = await fetch(`/api/admin/export?format=${format}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = `export.${format}`;
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
            if (fileNameMatch && fileNameMatch.length === 2) {
                fileName = fileNameMatch[1];
            }
        }
        
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        setShowExportModal(false);
        toast({
            title: "Export Successful",
            description: `User data has been exported as ${fileName}.`,
        });

    } catch (error) {
        console.error("Export error:", error);
        toast({
            title: "Export Failed",
            description: "Could not export user data.",
            variant: "destructive",
        });
    }
  };

  const statItems = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12%",
      changeText: "from last import",
      icon: Users,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Confirmed",
      value: stats?.confirmed || 0,
      change: `${stats?.confirmationRate || 0}%`,
      changeText: "confirmation rate",
      icon: Shield,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Updated Info",
      value: stats?.updated || 0,
      change: `+${stats?.todayUpdates || 0}`,
      changeText: "today",
      icon: Shield,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Pending",
      value: stats?.pending || 0,
      change: "",
      changeText: "Awaiting response",
      icon: Shield,
      bgColor: "bg-gray-100",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <Layout
      activePage="dashboard"
      onLogout={handleLogout}
      onImportClick={() => setShowImportModal(true)}
    >
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map((item, index) => (
          <Card key={index} className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{item.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                </div>
                <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                  <item.icon className={`${item.iconColor}`} size={20} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {item.change && (
                  <span className="text-green-600 text-sm font-medium">{item.change}</span>
                )}
                <span className="text-gray-500 text-sm ml-2">{item.changeText}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowImportModal(true)}
                className="w-full justify-start space-x-3 rounded-xl"
              >
                <Upload size={16} />
                <span>Import New File</span>
              </Button>
              <Button variant="secondary" className="w-full justify-start space-x-3 rounded-xl" onClick={() => setShowExportModal(true)}>
                <Download size={16} />
                <span>Export Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Recent Updates Alert */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Updates</h3>
                <Badge variant="destructive">Live</Badge>
              </div>
              <div className="space-y-3">
                {recentUpdates?.users?.slice(0, 2).map((update: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">!</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{update.first_name} {update.last_name}</p>
                        <p className="text-sm text-gray-600">{update.email}</p>
                        <p className="text-xs text-gray-500">{new Date(update.last_updated).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => { setSelectedUpdate(update); setUpdateModalOpen(true); }}>
                      View Changes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* User Management Table */}
      <Card className="shadow-sm border border-gray-100 overflow-hidden">
        <CardContent className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Import History & User Status</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <UserTable searchTerm={searchTerm} statusFilter={statusFilter} statusResend={0} />
      </Card>
      <FileImportModal 
        open={showImportModal} 
        onOpenChange={setShowImportModal} 
      />
      <ExportModal open={showExportModal} onOpenChange={setShowExportModal} onExport={handleExport} />
      <RecentUpdateModal open={updateModalOpen} onOpenChange={setUpdateModalOpen} user={selectedUpdate} />
    </Layout>
  );
}
