import { useState, useEffect } from 'react';
import { mockDashboardApi, realDashboardApi, USE_MOCK_DASHBOARD_API, UserTheme } from '@/services/dashboardApi';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Palette, Plus, Edit, Trash2, Check } from 'lucide-react';

interface ThemeManagerProps {
  userId: string;
}

const ThemeManager = ({ userId }: ThemeManagerProps) => {
  const [themes, setThemes] = useState<UserTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<UserTheme | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#F8FAFC',
    textColor: '#1F2937'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      const data = await api.getUserThemes();
      setThemes(data.content || []);
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch themes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTheme = async () => {
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.createUserTheme({
        ...formData,
        userId,
        isActive: false
      });
      
      await fetchThemes();
      setShowCreateModal(false);
      resetForm();
      toast({
        title: "Success",
        description: "Theme created successfully!",
      });
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: "Error",
        description: "Failed to create theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTheme = async () => {
    if (!editingTheme) return;
    
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.updateUserTheme(editingTheme.id, formData);
      
      await fetchThemes();
      setEditingTheme(null);
      resetForm();
      toast({
        title: "Success",
        description: "Theme updated successfully!",
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Error",
        description: "Failed to update theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.deleteUserTheme(id);
      
      await fetchThemes();
      toast({
        title: "Success",
        description: "Theme deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        title: "Error",
        description: "Failed to delete theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleActivateTheme = async (id: string) => {
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      
      // Deactivate all themes first
      for (const theme of themes) {
        if (theme.isActive) {
          await api.updateUserTheme(theme.id, { isActive: false });
        }
      }
      
      // Activate selected theme
      await api.updateUserTheme(id, { isActive: true });
      
      await fetchThemes();
      toast({
        title: "Success",
        description: "Theme activated successfully!",
      });
    } catch (error) {
      console.error('Error activating theme:', error);
      toast({
        title: "Error",
        description: "Failed to activate theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#F8FAFC',
      textColor: '#1F2937'
    });
  };

  const openEditModal = (theme: UserTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      textColor: theme.textColor
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading themes...</div>;
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <span>Theme Customization</span>
            </CardTitle>
            <CardDescription>Personalize your workspace appearance</CardDescription>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                New Theme
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Theme</DialogTitle>
                <DialogDescription>Design your custom theme</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Theme Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Primary Color</label>
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Secondary Color</label>
                    <Input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Background Color</label>
                    <Input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Text Color</label>
                    <Input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateTheme} className="flex-1">Create Theme</Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div key={theme.id} className="relative border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{theme.name}</h3>
                {theme.isActive && (
                  <Badge className="bg-green-100 text-green-800 rounded-full">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div 
                  className="h-6 rounded" 
                  style={{ backgroundColor: theme.primaryColor }}
                  title="Primary Color"
                />
                <div 
                  className="h-6 rounded" 
                  style={{ backgroundColor: theme.secondaryColor }}
                  title="Secondary Color"
                />
                <div 
                  className="h-6 rounded border" 
                  style={{ backgroundColor: theme.backgroundColor }}
                  title="Background Color"
                />
                <div 
                  className="h-6 rounded" 
                  style={{ backgroundColor: theme.textColor }}
                  title="Text Color"
                />
              </div>
              
              <div className="flex space-x-2">
                {!theme.isActive && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleActivateTheme(theme.id)}
                    className="flex-1"
                  >
                    Activate
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => openEditModal(theme)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDeleteTheme(theme.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Theme Modal */}
        {editingTheme && (
          <Dialog open={!!editingTheme} onOpenChange={() => setEditingTheme(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Theme</DialogTitle>
                <DialogDescription>Modify your theme settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Theme Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Primary Color</label>
                    <Input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Secondary Color</label>
                    <Input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Background Color</label>
                    <Input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Text Color</label>
                    <Input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateTheme} className="flex-1">Update Theme</Button>
                  <Button variant="outline" onClick={() => setEditingTheme(null)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemeManager;
