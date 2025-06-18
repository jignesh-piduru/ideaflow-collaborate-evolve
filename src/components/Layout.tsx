import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  Users, 
  Database, 
  Settings, 
  LogOut, 
  TrendingUp,
  BarChart3,
  FileText,
  Code,
  Rocket,
  Home
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'employee';
}

const Layout = ({ children, userRole }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/', roles: ['admin', 'employee'] },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, path: '/ideas', roles: ['admin', 'employee'] },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, path: '/progress', roles: ['admin', 'employee'] },
    { id: 'assignments', label: 'Assignments', icon: Users, path: '/assignments', roles: ['admin'] },
    { id: 'database', label: 'Database Tracker', icon: Database, path: '/database', roles: ['admin', 'employee'] },
    { id: 'api', label: 'API Development', icon: Code, path: '/api', roles: ['admin', 'employee'] },
    { id: 'deployment', label: 'Deployment', icon: Rocket, path: '/deployment', roles: ['admin', 'employee'] },
    { id: 'evidence', label: 'Evidence', icon: FileText, path: '/evidence', roles: ['admin', 'employee'] },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', roles: ['admin', 'employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const isActiveRoute = (path: string) => {
    if (path === '/ideas') {
      return location.pathname === '/ideas' || location.pathname.startsWith('/ideas/');
    }
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate('/');
  };

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
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                isActiveRoute(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8">
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userRole === 'admin' ? 'A' : 'E'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 capitalize">{userRole}</p>
                <p className="text-sm text-gray-500">Active User</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
