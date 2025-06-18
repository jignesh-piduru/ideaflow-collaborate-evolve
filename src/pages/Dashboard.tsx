import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import ThemeManager from '@/components/ThemeManager';
import IntegrationManager from '@/components/IntegrationManager';
import RoleManager from '@/components/RoleManager';
import SubscriptionManager from '@/components/SubscriptionManager';
import ideasApi from '@/services/ideasApi';
import subscriptionApi from '@/services/subscriptionApi';
import {
  Lightbulb,
  Database,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Upload,
  Calendar,
  Bell,
  Code,
  Rocket,
  Shield,
  Palette,
  Zap,
  Github,
  Slack,
  CreditCard
} from 'lucide-react';
import IdeaManagement from '@/components/IdeaManagement';
import ProgressTracking from '@/components/ProgressTracking';
import EvidenceUpload from '@/components/EvidenceUpload';
import DatabaseTracker from './DatabaseTracker';
import ApiDevelopment from './ApiDevelopment';
import Deployment from './Deployment';
import Evidence from './Evidence';

interface Idea {
  id: number | string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  tags: string[];
  assignedTo: string;
  upvotes: number;
  comments: number;
  dueDate: string;
  createdDate: string;
}

interface DashboardProps {
  userRole: 'admin' | 'employee';
  onLogout: () => void;
}

const Dashboard = ({ userRole, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({
    totalIdeas: 0,
    inProgressIdeas: 0,
    completedIdeas: 0,
    totalUpvotes: 0,
    activeSubscriptions: 0,
    apiEndpoints: 0,
    evidenceFiles: 0,
    teamMembers: 0
  });
  const { toast } = useToast();

  // Fetch overview data from all systems
  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      // Fetch ideas data
      const ideasResponse = await ideasApi.getIdeas();
      const ideasData = ideasResponse.content || [];
      setIdeas(ideasData);

      // Calculate idea statistics
      const totalIdeas = ideasData.length;
      const inProgressIdeas = ideasData.filter(idea => idea.status === 'IN_PROGRESS').length;
      const completedIdeas = ideasData.filter(idea => idea.status === 'COMPLETED').length;
      const totalUpvotes = ideasData.reduce((sum, idea) => sum + (idea.upvotes || 0), 0);

      // Fetch subscription data
      let activeSubscriptions = 0;
      try {
        const subscriptionsResponse = await subscriptionApi.getSubscriptions();
        activeSubscriptions = (subscriptionsResponse.content || []).filter(sub => sub.status === 'ACTIVE').length;
      } catch (error) {
        console.log('Subscriptions API not available, using default value');
      }

      // Fetch API endpoints data
      let apiEndpoints = 0;
      try {
        const endpointsResponse = await fetch('http://localhost:8081/api/endpoints');
        if (endpointsResponse.ok) {
          const endpointsData = await endpointsResponse.json();
          apiEndpoints = (endpointsData.content || endpointsData || []).length;
        }
      } catch (error) {
        console.log('API endpoints not available, using default value');
      }

      // Calculate team members from unique assignees
      const uniqueAssignees = new Set(ideasData.map(idea => idea.assignedTo).filter(assignee => assignee && assignee !== 'Unassigned'));
      const teamMembers = uniqueAssignees.size;

      // Update overview data
      setOverviewData({
        totalIdeas,
        inProgressIdeas,
        completedIdeas,
        totalUpvotes,
        activeSubscriptions,
        apiEndpoints,
        evidenceFiles: 12, // Placeholder - would come from evidence API
        teamMembers
      });

    } catch (error) {
      console.error('Error fetching overview data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch overview data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['admin', 'employee'] },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, roles: ['admin', 'employee'] },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, roles: ['admin', 'employee'] },
    { id: 'database', label: 'Database Tracker', icon: Database, roles: ['admin', 'employee'] },
    { id: 'api', label: 'API Development', icon: Code, roles: ['admin', 'employee'] },
    { id: 'deployment', label: 'Deployment', icon: Rocket, roles: ['admin', 'employee'] },
    { id: 'evidence', label: 'Evidence', icon: FileText, roles: ['admin', 'employee'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Enhanced stats from multiple APIs with real-time data
  const safeIdeas = ideas || [];
  const stats = [
    {
      title: 'Total Ideas',
      value: overviewData.totalIdeas.toString(),
      change: `${overviewData.totalUpvotes} total upvotes`,
      icon: Lightbulb,
      color: 'text-blue-500'
    },
    {
      title: 'In Progress',
      value: overviewData.inProgressIdeas.toString(),
      change: `${overviewData.completedIdeas} completed`,
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      title: 'API Endpoints',
      value: overviewData.apiEndpoints.toString(),
      change: `${overviewData.activeSubscriptions} active subscriptions`,
      icon: Code,
      color: 'text-green-500'
    },
    {
      title: 'Team Members',
      value: overviewData.teamMembers.toString(),
      change: `${overviewData.evidenceFiles} evidence files`,
      icon: Database,
      color: 'text-purple-500'
    },
  ];

  // Generate recent activities from real API data with safety checks
  const recentActivities = safeIdeas
    .sort((a, b) => new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime())
    .slice(0, 4)
    .map(idea => ({
      user: idea.assignedTo || 'Unassigned',
      action: `submitted "${idea.title || 'Untitled'}"`,
      time: new Date(idea.createdDate || '').toLocaleDateString(),
      type: 'idea',
      priority: idea.priority || 'MEDIUM',
      status: idea.status || 'PENDING'
    }));

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userRole === 'admin' ? 'Admin' : 'Employee'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's your real-time overview with data from Ideas, APIs, Subscriptions, and more.
          </p>
          <div className="flex items-center space-x-3 mt-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              🔄 Live Data
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              📊 Multi-System Integration
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchOverviewData}
          disabled={loading}
          className="rounded-xl"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
          ) : (
            <TrendingUp className="w-4 h-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => (
            <Card key={index} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gray-50`}>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Recent Activities</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {activity.user === 'Unassigned' ? 'UN' : activity.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.user} {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={activity.priority === 'HIGH' ? 'destructive' :
                              activity.priority === 'MEDIUM' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.priority}
                    </Badge>
                    <Badge
                      variant={activity.status === 'COMPLETED' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activities found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-12"
              onClick={() => setActiveTab('ideas')}
            >
              <Lightbulb className="w-4 h-4 mr-3" />
              Create New Idea
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-12"
              onClick={() => setShowEvidenceModal(true)}
            >
              <Upload className="w-4 h-4 mr-3" />
              Upload Evidence
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-12"
              onClick={() => setActiveTab('progress')}
            >
              <TrendingUp className="w-4 h-4 mr-3" />
              Track Progress
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-12"
              onClick={() => setActiveTab('api')}
            >
              <Code className="w-4 h-4 mr-3" />
              API Development
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-lg text-gray-600">Manage your preferences and integrations</p>
      </div>

      <Tabs defaultValue="themes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl">
          <TabsTrigger value="themes" className="rounded-xl">
            <Palette className="w-4 h-4 mr-2" />
            Themes
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-xl">
            <Zap className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-xl">
            <Shield className="w-4 h-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-xl">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="mt-8">
          <ThemeManager userId="b032f00f-9a5e-43f0-9ac2-9e028815e847" />
        </TabsContent>

        <TabsContent value="integrations" className="mt-8">
          <IntegrationManager userId="afde270f-a1c4-4b75-a3d7-ba861609df0c" />
        </TabsContent>

        <TabsContent value="roles" className="mt-8">
          <RoleManager userRole={userRole} />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-8">
          <SubscriptionManager userId="b032f00f-9a5e-43f0-9ac2-9e028815e847" />
        </TabsContent>
      </Tabs>

      {/* Additional Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8">
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <span>General Settings</span>
            </CardTitle>
            <CardDescription>Configure general application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Current Role</p>
                <p className="text-sm text-gray-600 capitalize">{userRole}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 rounded-full">Active</Badge>
            </div>
            <Button variant="outline" className="w-full rounded-xl">
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex w-full">
      {/* Static Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">IdeaFlow</span>
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <Separator className="my-8" />

        <div className="space-y-4">
          <div className="flex items-center space-x-3 px-4 py-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                {userRole === 'admin' ? 'AD' : 'EM'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{userRole === 'admin' ? 'Admin User' : 'Employee'}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-scroll">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="rounded-full px-4 py-2 text-sm font-medium">
                {userRole.toUpperCase()}
              </Badge>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-2xl">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'ideas' && <IdeaManagement userRole={userRole} />}
          {activeTab === 'progress' && <ProgressTracking userRole={userRole} />}
          {activeTab === 'database' && <DatabaseTracker userRole={userRole} />}
          {activeTab === 'api' && <ApiDevelopment userRole={userRole} />}
          {activeTab === 'deployment' && <Deployment userRole={userRole} />}
          {activeTab === 'evidence' && <Evidence userRole={userRole} />}
          {activeTab === 'settings' && renderSettings()}

        </div>
      </div>

      {/* Evidence Upload Modal */}
      {showEvidenceModal && (
        <EvidenceUpload onClose={() => setShowEvidenceModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
