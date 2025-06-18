import { useState, useEffect } from 'react';
import { mockDashboardApi, realDashboardApi, USE_MOCK_DASHBOARD_API, IntegrationSetting } from '@/services/dashboardApi';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Plus, Github, Slack, Settings, Trash2, Edit } from 'lucide-react';

interface IntegrationManagerProps {
  userId: string;
}

const IntegrationManager = ({ userId }: IntegrationManagerProps) => {
  const [integrations, setIntegrations] = useState<IntegrationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<IntegrationSetting | null>(null);
  const [formData, setFormData] = useState({
    type: 'GITHUB' as 'GITHUB' | 'SLACK' | 'JIRA' | 'TEAMS' | 'DISCORD',
    connected: false,
    config: ''
  });
  const { toast } = useToast();

  const integrationTypes = [
    { value: 'GITHUB', label: 'GitHub', icon: Github, description: 'Code repository sync' },
    { value: 'SLACK', label: 'Slack', icon: Slack, description: 'Team communication' },
    { value: 'JIRA', label: 'Jira', icon: Settings, description: 'Project management' },
    { value: 'TEAMS', label: 'Microsoft Teams', icon: Settings, description: 'Team collaboration' },
    { value: 'DISCORD', label: 'Discord', icon: Settings, description: 'Community chat' }
  ];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      const data = await api.getIntegrationSettings();
      setIntegrations(data.content || []);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch integrations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.createIntegrationSetting({
        ...formData,
        userId
      });
      
      await fetchIntegrations();
      setShowCreateModal(false);
      resetForm();
      toast({
        title: "Success",
        description: "Integration created successfully!",
      });
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateIntegration = async () => {
    if (!editingIntegration) return;
    
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.updateIntegrationSetting(editingIntegration.id, formData);
      
      await fetchIntegrations();
      setEditingIntegration(null);
      resetForm();
      toast({
        title: "Success",
        description: "Integration updated successfully!",
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;
    
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.deleteIntegrationSetting(id);
      
      await fetchIntegrations();
      toast({
        title: "Success",
        description: "Integration deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Error",
        description: "Failed to delete integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleConnection = async (integration: IntegrationSetting) => {
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.updateIntegrationSetting(integration.id, {
        connected: !integration.connected
      });
      
      await fetchIntegrations();
      toast({
        title: "Success",
        description: `Integration ${integration.connected ? 'disconnected' : 'connected'} successfully!`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: "Failed to toggle integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'GITHUB',
      connected: false,
      config: ''
    });
  };

  const openEditModal = (integration: IntegrationSetting) => {
    setEditingIntegration(integration);
    setFormData({
      type: integration.type,
      connected: integration.connected,
      config: integration.config
    });
  };

  const getIntegrationIcon = (type: string) => {
    const integration = integrationTypes.find(i => i.value === type);
    return integration?.icon || Settings;
  };

  const getIntegrationLabel = (type: string) => {
    const integration = integrationTypes.find(i => i.value === type);
    return integration?.label || type;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading integrations...</div>;
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>Integration Settings</span>
            </CardTitle>
            <CardDescription>Connect with external tools and services</CardDescription>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Integration</DialogTitle>
                <DialogDescription>Connect a new external service</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Integration Type</label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration type" />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Configuration (JSON)</label>
                  <Textarea
                    placeholder='{"token": "your-token", "webhook": "your-webhook-url"}'
                    value={formData.config}
                    onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.connected}
                    onCheckedChange={(checked) => setFormData({ ...formData, connected: checked })}
                  />
                  <label className="text-sm font-medium">Connect immediately</label>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateIntegration} className="flex-1">Add Integration</Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map((integration) => {
          const IconComponent = getIntegrationIcon(integration.type);
          return (
            <div key={integration.id} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <IconComponent className="w-6 h-6" />
                <div>
                  <p className="font-medium">{getIntegrationLabel(integration.type)}</p>
                  <p className="text-sm text-gray-600">
                    {integrationTypes.find(t => t.value === integration.type)?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge 
                  className={`rounded-full ${
                    integration.connected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {integration.connected ? 'Connected' : 'Disconnected'}
                </Badge>
                
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleConnection(integration)}
                    className="rounded-xl"
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(integration)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteIntegration(integration.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {integrations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No integrations configured yet.</p>
            <p className="text-sm">Add your first integration to get started.</p>
          </div>
        )}

        {/* Edit Integration Modal */}
        {editingIntegration && (
          <Dialog open={!!editingIntegration} onOpenChange={() => setEditingIntegration(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Integration</DialogTitle>
                <DialogDescription>Modify integration settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Integration Type</label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="w-4 h-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Configuration (JSON)</label>
                  <Textarea
                    value={formData.config}
                    onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.connected}
                    onCheckedChange={(checked) => setFormData({ ...formData, connected: checked })}
                  />
                  <label className="text-sm font-medium">Connected</label>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateIntegration} className="flex-1">Update Integration</Button>
                  <Button variant="outline" onClick={() => setEditingIntegration(null)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationManager;
