
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Lightbulb,
  Database,
  Settings,
  LogOut,
  TrendingUp,
  BarChart3,
  FileText,
  Code,
  Rocket,
  Users
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'admin' | 'employee';
  onLogout: () => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab, userRole, onLogout }: DashboardSidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['admin', 'employee'] },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, roles: ['admin', 'employee'] },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, roles: ['admin', 'employee'] },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'employee'] },
    { id: 'database', label: 'Database Tracker', icon: Database, roles: ['admin', 'employee'] },
    { id: 'api', label: 'API Development', icon: Code, roles: ['admin', 'employee'] },
    { id: 'deployment', label: 'Deployment', icon: Rocket, roles: ['admin', 'employee'] },
    { id: 'evidence', label: 'Evidence', icon: FileText, roles: ['admin', 'employee'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin', 'employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
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
  );
};

export default DashboardSidebar;
