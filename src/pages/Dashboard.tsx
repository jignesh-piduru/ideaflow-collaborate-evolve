
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  Users, 
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

interface DashboardProps {
  userRole: 'admin' | 'employee';
  onLogout: () => void;
}

const Dashboard = ({ userRole, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['admin', 'employee'] },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, roles: ['admin', 'employee'] },
    { id: 'assignments', label: 'Assignments', icon: Users, roles: ['admin'] },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, roles: ['admin', 'employee'] },
    { id: 'database', label: 'Database Tracker', icon: Database, roles: ['admin', 'employee'] },
    { id: 'api', label: 'API Development', icon: Code, roles: ['admin', 'employee'] },
    { id: 'deployment', label: 'Deployment', icon: Rocket, roles: ['admin', 'employee'] },
    { id: 'evidence', label: 'Evidence', icon: FileText, roles: ['admin', 'employee'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const stats = [
    { title: 'Total Ideas', value: '24', change: '+12%', icon: Lightbulb, color: 'text-blue-500' },
    { title: 'In Progress', value: '8', change: '+5%', icon: Clock, color: 'text-yellow-500' },
    { title: 'Completed', value: '12', change: '+25%', icon: CheckCircle, color: 'text-green-500' },
    { title: 'Pending Review', value: '4', change: '-8%', icon: AlertCircle, color: 'text-red-500' },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'submitted new idea', time: '2 hours ago', type: 'idea' },
    { user: 'Sarah Smith', action: 'completed API development', time: '4 hours ago', type: 'api' },
    { user: 'Mike Johnson', action: 'uploaded evidence', time: '6 hours ago', type: 'evidence' },
    { user: 'Lisa Chen', action: 'updated database schema', time: '8 hours ago', type: 'database' },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userRole === 'admin' ? 'Admin' : 'Employee'}! 👋
          </h1>
          <p className="text-lg text-gray-600">Here's what's happening with your ideas today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-2xl bg-gray-50`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Recent Activities</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user} {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start rounded-xl h-12">
              <Lightbulb className="w-4 h-4 mr-3" />
              Create New Idea
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-12" onClick={() => setShowEvidenceModal(true)}>
              <Upload className="w-4 h-4 mr-3" />
              Upload Evidence
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-12">
              <Calendar className="w-4 h-4 mr-3" />
              Schedule Review
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-12">
              <FileText className="w-4 h-4 mr-3" />
              Generate Report
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <span>Theme Customization</span>
            </CardTitle>
            <CardDescription>Personalize your workspace appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border-2 border-blue-200 rounded-xl bg-blue-50 cursor-pointer">
                <div className="w-full h-8 bg-blue-500 rounded mb-2"></div>
                <p className="text-xs text-center">Blue</p>
              </div>
              <div className="p-3 border rounded-xl bg-gray-50 cursor-pointer hover:border-gray-300">
                <div className="w-full h-8 bg-purple-500 rounded mb-2"></div>
                <p className="text-xs text-center">Purple</p>
              </div>
              <div className="p-3 border rounded-xl bg-gray-50 cursor-pointer hover:border-gray-300">
                <div className="w-full h-8 bg-green-500 rounded mb-2"></div>
                <p className="text-xs text-center">Green</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>User Roles & Access</span>
            </CardTitle>
            <CardDescription>Manage permissions and access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium">Current Role</p>
                <p className="text-sm text-gray-600 capitalize">{userRole}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 rounded-full">Active</Badge>
            </div>
            {userRole === 'admin' && (
              <Button className="w-full rounded-xl">
                Manage Team Permissions
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>Integration Settings</span>
            </CardTitle>
            <CardDescription>Connect with external tools and services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-xl">
              <div className="flex items-center space-x-3">
                <Github className="w-6 h-6" />
                <div>
                  <p className="font-medium">GitHub</p>
                  <p className="text-sm text-gray-600">Code repository sync</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-xl">
              <div className="flex items-center space-x-3">
                <Slack className="w-6 h-6" />
                <div>
                  <p className="font-medium">Slack</p>
                  <p className="text-sm text-gray-600">Team notifications</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">Connect</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Subscription & Billing</span>
            </CardTitle>
            <CardDescription>Manage your premium features and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-indigo-900">Premium Plan</p>
                <Badge className="bg-indigo-100 text-indigo-800 rounded-full">Active</Badge>
              </div>
              <p className="text-sm text-indigo-700">Advanced features unlocked</p>
            </div>
            <Button variant="outline" className="w-full rounded-xl">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex w-full">
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
      <div className="flex-1 p-8">
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
          {activeTab === 'assignments' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Management</h3>
              <p className="text-gray-600">Advanced assignment features coming soon with enhanced workflow management.</p>
            </div>
          )}
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
