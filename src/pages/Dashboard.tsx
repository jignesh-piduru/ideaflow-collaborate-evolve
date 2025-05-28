
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
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Upload,
  Calendar,
  Search,
  Filter,
  Bell
} from 'lucide-react';
import IdeaManagement from '@/components/IdeaManagement';
import ProgressTracking from '@/components/ProgressTracking';
import EvidenceUpload from '@/components/EvidenceUpload';

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
    { id: 'api', label: 'API Development', icon: Settings, roles: ['admin', 'employee'] },
    { id: 'deployment', label: 'Deployment', icon: Upload, roles: ['admin', 'employee'] },
    { id: 'evidence', label: 'Evidence', icon: FileText, roles: ['admin', 'employee'] },
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userRole === 'admin' ? 'Admin' : 'Employee'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your ideas today.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            New Idea
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <Badge variant="outline">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Create New Idea
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setShowEvidenceModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Evidence
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Review
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">IdeaFlow</span>
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <Separator className="my-6" />

        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{userRole === 'admin' ? 'AD' : 'EM'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userRole === 'admin' ? 'Admin User' : 'Employee'}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{userRole.toUpperCase()}</Badge>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'ideas' && <IdeaManagement userRole={userRole} />}
          {activeTab === 'progress' && <ProgressTracking userRole={userRole} />}
          {(activeTab === 'assignments' || activeTab === 'database' || activeTab === 'api' || activeTab === 'deployment' || activeTab === 'evidence') && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">This feature is under development and will be available soon.</p>
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
