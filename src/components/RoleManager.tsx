import { useState, useEffect } from 'react';
import { mockDashboardApi, realDashboardApi, USE_MOCK_DASHBOARD_API, Role } from '@/services/dashboardApi';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, Edit, Trash2, Users } from 'lucide-react';

interface RoleManagerProps {
  userRole: 'admin' | 'employee';
}

const RoleManager = ({ userRole }: RoleManagerProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE' | 'MANAGER' | 'VIEWER',
    description: '',
    permissions: [] as string[]
  });
  const { toast } = useToast();

  const availablePermissions = [
    'CREATE',
    'READ', 
    'UPDATE',
    'DELETE',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'MANAGE_PROJECTS',
    'MANAGE_EVIDENCE',
    'MANAGE_INTEGRATIONS',
    'VIEW_ANALYTICS',
    'EXPORT_DATA',
    'ADMIN_SETTINGS'
  ];

  const roleTypes = [
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'VIEWER', label: 'Viewer' }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      const data = await api.getRoles();
      setRoles(data.content || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.createRole(formData);
      
      await fetchRoles();
      setShowCreateModal(false);
      resetForm();
      toast({
        title: "Success",
        description: "Role created successfully!",
      });
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.updateRole(editingRole.id, formData);
      
      await fetchRoles();
      setEditingRole(null);
      resetForm();
      toast({
        title: "Success",
        description: "Role updated successfully!",
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const api = USE_MOCK_DASHBOARD_API ? mockDashboardApi : realDashboardApi;
      await api.deleteRole(id);
      
      await fetchRoles();
      toast({
        title: "Success",
        description: "Role deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: "Failed to delete role. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: 'EMPLOYEE',
      description: '',
      permissions: []
    });
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...(role.permissions || [])]
    });
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const currentPermissions = formData.permissions || [];
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...currentPermissions, permission]
      });
    } else {
      setFormData({
        ...formData,
        permissions: currentPermissions.filter(p => p !== permission)
      });
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'EMPLOYEE': return 'bg-green-100 text-green-800';
      case 'VIEWER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading roles...</div>;
  }

  // Only admins can manage roles
  if (userRole !== 'admin') {
    return (
      <Card className="rounded-2xl shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span>User Roles & Access</span>
          </CardTitle>
          <CardDescription>Manage permissions and access control</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Access Denied</p>
            <p className="text-sm">Only administrators can manage roles.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-lg border-0 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>User Roles & Access</span>
            </CardTitle>
            <CardDescription>Manage permissions and access control</CardDescription>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new user role with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Role Name</label>
                  <Select value={formData.name} onValueChange={(value: any) => setFormData({ ...formData, name: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe the role and its responsibilities"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Permissions</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {availablePermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={(formData.permissions || []).includes(permission)}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <label htmlFor={permission} className="text-sm font-medium cursor-pointer">
                          {permission.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateRole} className="flex-1">Create Role</Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map((role) => (
          <div key={role.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Badge className={`rounded-full ${getRoleColor(role.name)}`}>
                  {role.name}
                </Badge>
                <div>
                  <h3 className="font-medium">{role.description}</h3>
                  <p className="text-sm text-gray-600">
                    {(role.permissions || []).length} permissions
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(role)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteRole(role.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {(role.permissions || []).map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        {roles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No roles configured yet.</p>
            <p className="text-sm">Create your first role to get started.</p>
          </div>
        )}

        {/* Edit Role Modal */}
        {editingRole && (
          <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
                <DialogDescription>Modify role settings and permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Role Name</label>
                  <Select value={formData.name} onValueChange={(value: any) => setFormData({ ...formData, name: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Permissions</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {availablePermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${permission}`}
                          checked={(formData.permissions || []).includes(permission)}
                          onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                        />
                        <label htmlFor={`edit-${permission}`} className="text-sm font-medium cursor-pointer">
                          {permission.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateRole} className="flex-1">Update Role</Button>
                  <Button variant="outline" onClick={() => setEditingRole(null)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleManager;
