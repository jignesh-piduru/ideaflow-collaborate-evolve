
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import DashboardSettings from '@/components/dashboard/DashboardSettings';
import IdeaManagement from '@/components/IdeaManagement';
import ProgressTracking from '@/components/ProgressTracking';
import EvidenceUpload from '@/components/EvidenceUpload';
import DatabaseTracker from './DatabaseTracker';
import ApiDevelopment from './ApiDevelopment';
import Deployment from './Deployment';
import Evidence from './Evidence';
import Employees from './Employees';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Calendar } from 'lucide-react';

interface DashboardProps {
  userRole: 'admin' | 'employee';
  onLogout: () => void;
}

const Dashboard = ({ userRole, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const { toast } = useToast();

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex w-full">
      {/* Static Sidebar */}
      <DashboardSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        onLogout={onLogout}
      />

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
          {activeTab === 'overview' && <DashboardOverview userRole={userRole} setShowEvidenceModal={setShowEvidenceModal} setActiveTab={setActiveTab} />}
          {activeTab === 'ideas' && <IdeaManagement userRole={userRole} />}
          {activeTab === 'progress' && <ProgressTracking userRole={userRole} />}
          {activeTab === 'employees' && <Employees userRole={userRole} />}
          {activeTab === 'database' && <DatabaseTracker userRole={userRole} />}
          {activeTab === 'api' && <ApiDevelopment userRole={userRole} />}
          {activeTab === 'deployment' && <Deployment userRole={userRole} />}
          {activeTab === 'evidence' && <Evidence userRole={userRole} />}
          {activeTab === 'settings' && <DashboardSettings userRole={userRole} />}
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
