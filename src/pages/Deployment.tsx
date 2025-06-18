
import { useState, useEffect } from 'react';
import { mockApi, USE_MOCK_API } from '@/services/mockApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Rocket,
  GitBranch,
  Server,

  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Play,
  RotateCcw,

  Activity,
  RefreshCw,
  Edit,
  Trash2,

} from 'lucide-react';

interface DeploymentProps {
  userRole: 'admin' | 'employee';
}

interface Deployment {
  id: number | string;
  name: string;
  environment: string;
  status: string;
  version: string;
  deployedAt?: string;
  branch?: string;
  commitHash?: string;
  health?: string;
  progress?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Environment {
  id: number | string;
  name: string;
  status: string;
  deployments?: number;
  lastUpdate?: string;
  description?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

interface DeploymentFormData {
  name: string;
  environment: string;
  version: string;
  branch: string;
  commitHash: string;
  description: string;
  status: string;
  health: string;
}

// Enum constants for dropdowns
const DEPLOYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'DEPLOYING', label: 'Deploying' },
  { value: 'DEPLOYED', label: 'Deployed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'MAINTENANCE', label: 'Maintenance' }
];

const HEALTH_STATUS_OPTIONS = [
  { value: 'UNKNOWN', label: 'Unknown' },
  { value: 'HEALTHY', label: 'Healthy' },
  { value: 'UNHEALTHY', label: 'Unhealthy' }
];

const ENVIRONMENT_OPTIONS = [
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'STAGING', label: 'Staging' },
  { value: 'PRODUCTION', label: 'Production' }
];

interface EnvironmentFormData {
  name: string;
  description: string;
  url: string;
}

const Deployment = ({ userRole }: DeploymentProps) => {
  const [activeTab, setActiveTab] = useState('pipelines');
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [environmentsLoading, setEnvironmentsLoading] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [showCreateDeploymentDialog, setShowCreateDeploymentDialog] = useState(false);
  const [showEditDeploymentDialog, setShowEditDeploymentDialog] = useState(false);
  const [showCreateEnvironmentDialog, setShowCreateEnvironmentDialog] = useState(false);
  const [showEditEnvironmentDialog, setShowEditEnvironmentDialog] = useState(false);
  const { toast } = useToast();

  const [deploymentForm, setDeploymentForm] = useState<DeploymentFormData>({
    name: '',
    environment: '',
    version: '',
    branch: '',
    commitHash: '',
    description: '',
    status: 'PENDING',
    health: 'UNKNOWN'
  });

  const [environmentForm, setEnvironmentForm] = useState<EnvironmentFormData>({
    name: '',
    description: '',
    url: ''
  });

  useEffect(() => {
    fetchDeployments();
    fetchEnvironments();
  }, []);

  // API Functions for Deployments
  const fetchDeployments = async () => {
    try {
      setLoading(true);
      console.log('Fetching deployments from /api/deployments');

      if (USE_MOCK_API) {
        console.log('Using mock API for deployments');
        const data = await mockApi.getDeployments();
        console.log('Fetched deployments data (mock):', data);
        setDeployments(data.content || []);
        return;
      }

      const response = await fetch('/api/deployments?page=0&size=20&sort=createdAt&direction=desc');
      console.log('Deployments response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Deployments error response:', errorText);
        throw new Error(`Failed to fetch deployments: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse<Deployment> = await response.json();
      console.log('Fetched deployments data:', data);

      setDeployments(data.content || []);
    } catch (error) {
      console.error('Error fetching deployments:', error);
      setDeployments([]);

      toast({
        title: "Error",
        description: "Failed to fetch deployments. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvironments = async () => {
    try {
      setEnvironmentsLoading(true);
      console.log('Fetching environments from /api/environments');

      if (USE_MOCK_API) {
        console.log('Using mock API for environments');
        const data = await mockApi.getEnvironments();
        console.log('Fetched environments data (mock):', data);
        setEnvironments(data.content || []);
        return;
      }

      const response = await fetch('/api/environments?page=0&size=20&sort=createdAt&direction=desc');
      console.log('Environments response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Environments error response:', errorText);
        throw new Error(`Failed to fetch environments: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse<Environment> = await response.json();
      console.log('Fetched environments data:', data);

      setEnvironments(data.content || []);
    } catch (error) {
      console.error('Error fetching environments:', error);
      setEnvironments([]);

      toast({
        title: "Error",
        description: "Failed to fetch environments. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setEnvironmentsLoading(false);
    }
  };

  const createDeployment = async (deploymentData: DeploymentFormData) => {
    try {
      console.log('Creating deployment with data:', deploymentData);

      if (USE_MOCK_API) {
        console.log('Using mock API for creating deployment');
        const result = await mockApi.createDeployment(deploymentData);
        console.log('Deployment created successfully (mock):', result);

        toast({
          title: "Success",
          description: "Deployment created successfully!",
        });

        setShowCreateDeploymentDialog(false);
        setDeploymentForm({
          name: '',
          environment: '',
          version: '',
          branch: '',
          commitHash: '',
          description: '',
          status: 'PENDING',
          health: 'UNKNOWN'
        });
        fetchDeployments();
        return;
      }

      const requestBody = {
        name: deploymentData.name,
        environment: deploymentData.environment,
        version: deploymentData.version,
        branch: deploymentData.branch,
        commitHash: deploymentData.commitHash,
        description: deploymentData.description,
        status: deploymentData.status,
        health: deploymentData.health,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create deployment error:', errorText);
        throw new Error(`Failed to create deployment: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Deployment created successfully:', result);

      toast({
        title: "Success",
        description: "Deployment created successfully!",
      });

      setShowCreateDeploymentDialog(false);
      setDeploymentForm({
        name: '',
        environment: '',
        version: '',
        branch: '',
        commitHash: '',
        description: '',
        status: 'PENDING',
        health: 'UNKNOWN'
      });
      fetchDeployments();
    } catch (error) {
      console.error('Error creating deployment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create deployment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateDeployment = async (id: number | string, deploymentData: DeploymentFormData) => {
    try {
      console.log('Updating deployment with ID:', id, 'Data:', deploymentData);

      if (USE_MOCK_API) {
        console.log('Using mock API for updating deployment');
        const result = await mockApi.updateDeployment(String(id), deploymentData);
        console.log('Deployment updated successfully (mock):', result);

        toast({
          title: "Success",
          description: "Deployment updated successfully!",
        });

        setShowEditDeploymentDialog(false);
        setSelectedDeployment(null);
        fetchDeployments();
        return;
      }

      const requestBody = {
        name: deploymentData.name,
        environment: deploymentData.environment,
        version: deploymentData.version,
        branch: deploymentData.branch,
        commitHash: deploymentData.commitHash,
        description: deploymentData.description,
        status: deploymentData.status,
        health: deploymentData.health,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/deployments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update deployment error:', errorText);
        throw new Error(`Failed to update deployment: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Deployment updated successfully:', result);

      toast({
        title: "Success",
        description: "Deployment updated successfully!",
      });

      setShowEditDeploymentDialog(false);
      setSelectedDeployment(null);
      fetchDeployments();
    } catch (error) {
      console.error('Error updating deployment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update deployment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteDeployment = async (id: number | string) => {
    try {
      console.log('Deleting deployment with ID:', id);

      if (USE_MOCK_API) {
        console.log('Using mock API for deleting deployment');
        await mockApi.deleteDeployment(String(id));
        console.log('Deployment deleted successfully (mock)');

        toast({
          title: "Success",
          description: "Deployment deleted successfully!",
        });

        fetchDeployments();
        return;
      }

      const response = await fetch(`/api/deployments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete deployment error:', errorText);
        throw new Error(`Failed to delete deployment: ${response.status} - ${errorText}`);
      }

      console.log('Deployment deleted successfully');

      toast({
        title: "Success",
        description: "Deployment deleted successfully!",
      });

      fetchDeployments();
    } catch (error) {
      console.error('Error deleting deployment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete deployment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Environment CRUD Functions
  const createEnvironment = async (environmentData: EnvironmentFormData) => {
    try {
      console.log('Creating environment with data:', environmentData);

      if (USE_MOCK_API) {
        console.log('Using mock API for creating environment');
        const result = await mockApi.createEnvironment(environmentData);
        console.log('Environment created successfully (mock):', result);

        toast({
          title: "Success",
          description: "Environment created successfully!",
        });

        setShowCreateEnvironmentDialog(false);
        setEnvironmentForm({
          name: '',
          description: '',
          url: ''
        });
        fetchEnvironments();
        return;
      }

      const requestBody = {
        name: environmentData.name,
        description: environmentData.description,
        url: environmentData.url,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/environments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create environment error:', errorText);
        throw new Error(`Failed to create environment: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Environment created successfully:', result);

      toast({
        title: "Success",
        description: "Environment created successfully!",
      });

      setShowCreateEnvironmentDialog(false);
      setEnvironmentForm({
        name: '',
        description: '',
        url: ''
      });
      fetchEnvironments();
    } catch (error) {
      console.error('Error creating environment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create environment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateEnvironment = async (id: number | string, environmentData: EnvironmentFormData) => {
    try {
      console.log('Updating environment with ID:', id, 'Data:', environmentData);

      if (USE_MOCK_API) {
        console.log('Using mock API for updating environment');
        const result = await mockApi.updateEnvironment(String(id), environmentData);
        console.log('Environment updated successfully (mock):', result);

        toast({
          title: "Success",
          description: "Environment updated successfully!",
        });

        setShowEditEnvironmentDialog(false);
        setSelectedEnvironment(null);
        fetchEnvironments();
        return;
      }

      const requestBody = {
        name: environmentData.name,
        description: environmentData.description,
        url: environmentData.url,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/environments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update environment error:', errorText);
        throw new Error(`Failed to update environment: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Environment updated successfully:', result);

      toast({
        title: "Success",
        description: "Environment updated successfully!",
      });

      setShowEditEnvironmentDialog(false);
      setSelectedEnvironment(null);
      fetchEnvironments();
    } catch (error) {
      console.error('Error updating environment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update environment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteEnvironment = async (id: number | string) => {
    try {
      console.log('Deleting environment with ID:', id);

      if (USE_MOCK_API) {
        console.log('Using mock API for deleting environment');
        await mockApi.deleteEnvironment(String(id));
        console.log('Environment deleted successfully (mock)');

        toast({
          title: "Success",
          description: "Environment deleted successfully!",
        });

        fetchEnvironments();
        return;
      }

      const response = await fetch(`/api/environments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete environment error:', errorText);
        throw new Error(`Failed to delete environment: ${response.status} - ${errorText}`);
      }

      console.log('Environment deleted successfully');

      toast({
        title: "Success",
        description: "Environment deleted successfully!",
      });

      fetchEnvironments();
    } catch (error) {
      console.error('Error deleting environment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete environment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DEPLOYED': case 'HEALTHY': case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DEPLOYING': case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': case 'UNHEALTHY': case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'UNKNOWN': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DEPLOYED': case 'HEALTHY': return CheckCircle;
      case 'DEPLOYING': return Clock;
      case 'FAILED': case 'UNHEALTHY': return AlertCircle;
      case 'PENDING': case 'UNKNOWN': return Clock;
      case 'MAINTENANCE': return AlertCircle;
      default: return Clock;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env?.toUpperCase()) {
      case 'PRODUCTION': return 'bg-red-100 text-red-800';
      case 'STAGING': return 'bg-yellow-100 text-yellow-800';
      case 'DEVELOPMENT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Deployment Center</h1>
          <p className="text-lg text-gray-600">Manage deployment pipelines, environments, and CI/CD workflows</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => {
              fetchDeployments();
              fetchEnvironments();
            }}
            disabled={loading || environmentsLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || environmentsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {(userRole === 'admin' || userRole === 'employee') && (
            <Dialog open={showCreateDeploymentDialog} onOpenChange={setShowCreateDeploymentDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Deployment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Deployment</DialogTitle>
                  <DialogDescription>
                    Add a new deployment to track and manage.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createDeployment(deploymentForm);
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Deployment Name</Label>
                    <Input
                      id="name"
                      value={deploymentForm.name}
                      onChange={(e) => setDeploymentForm({ ...deploymentForm, name: e.target.value })}
                      placeholder="e.g., Frontend Application"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="environment">Environment</Label>
                      <Select
                        value={deploymentForm.environment}
                        onValueChange={(value) => setDeploymentForm({ ...deploymentForm, environment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENVIRONMENT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={deploymentForm.version}
                        onChange={(e) => setDeploymentForm({ ...deploymentForm, version: e.target.value })}
                        placeholder="e.g., v1.0.0"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Input
                        id="branch"
                        value={deploymentForm.branch}
                        onChange={(e) => setDeploymentForm({ ...deploymentForm, branch: e.target.value })}
                        placeholder="e.g., main"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commitHash">Commit Hash</Label>
                      <Input
                        id="commitHash"
                        value={deploymentForm.commitHash}
                        onChange={(e) => setDeploymentForm({ ...deploymentForm, commitHash: e.target.value })}
                        placeholder="e.g., abc123f"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={deploymentForm.description}
                      onChange={(e) => setDeploymentForm({ ...deploymentForm, description: e.target.value })}
                      placeholder="Brief description of the deployment"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={deploymentForm.status}
                        onValueChange={(value) => setDeploymentForm({ ...deploymentForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPLOYMENT_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="health">Health</Label>
                      <Select
                        value={deploymentForm.health}
                        onValueChange={(value) => setDeploymentForm({ ...deploymentForm, health: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select health status" />
                        </SelectTrigger>
                        <SelectContent>
                          {HEALTH_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDeploymentDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                      Create Deployment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Deployment Dialog */}
          {(userRole === 'admin' || userRole === 'employee') && (
            <Dialog open={showEditDeploymentDialog} onOpenChange={setShowEditDeploymentDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Deployment</DialogTitle>
                  <DialogDescription>
                    Update deployment information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (selectedDeployment) {
                    updateDeployment(selectedDeployment.id, deploymentForm);
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Deployment Name</Label>
                    <Input
                      id="edit-name"
                      value={deploymentForm.name}
                      onChange={(e) => setDeploymentForm({ ...deploymentForm, name: e.target.value })}
                      placeholder="e.g., Frontend Application"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-environment">Environment</Label>
                      <Select
                        value={deploymentForm.environment}
                        onValueChange={(value) => setDeploymentForm({ ...deploymentForm, environment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {ENVIRONMENT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-version">Version</Label>
                      <Input
                        id="edit-version"
                        value={deploymentForm.version}
                        onChange={(e) => setDeploymentForm({ ...deploymentForm, version: e.target.value })}
                        placeholder="e.g., v1.0.0"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-branch">Branch</Label>
                      <Input
                        id="edit-branch"
                        value={deploymentForm.branch}
                        onChange={(e) => setDeploymentForm({ ...deploymentForm, branch: e.target.value })}
                        placeholder="e.g., main"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-commitHash">Commit Hash</Label>
                      <Input
                        id="edit-commitHash"
                        value={deploymentForm.commitHash}
                        onChange={(e) => setDeploymentForm({ ...deploymentForm, commitHash: e.target.value })}
                        placeholder="e.g., abc123f"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={deploymentForm.description}
                      onChange={(e) => setDeploymentForm({ ...deploymentForm, description: e.target.value })}
                      placeholder="Brief description of the deployment"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={deploymentForm.status}
                        onValueChange={(value) => setDeploymentForm({ ...deploymentForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPLOYMENT_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-health">Health</Label>
                      <Select
                        value={deploymentForm.health}
                        onValueChange={(value) => setDeploymentForm({ ...deploymentForm, health: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select health status" />
                        </SelectTrigger>
                        <SelectContent>
                          {HEALTH_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowEditDeploymentDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                      Update Deployment
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="pipelines" className="rounded-xl">Deployment Pipelines</TabsTrigger>
          <TabsTrigger value="environments" className="rounded-xl">Environments</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl">Deployment History</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-6">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                        <div>
                          <div className="w-40 h-5 bg-gray-200 rounded mb-2"></div>
                          <div className="w-60 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                      <div className="flex space-x-2">
                        <div className="w-16 h-8 bg-gray-200 rounded-xl"></div>
                        <div className="w-16 h-8 bg-gray-200 rounded-xl"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : deployments.length === 0 ? (
              <Card className="rounded-2xl shadow-lg border-0 bg-white">
                <CardContent className="text-center py-12">
                  <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments found</h3>
                  <p className="text-gray-600 mb-6">Create your first deployment to get started</p>
                  {(userRole === 'admin' || userRole === 'employee') && (
                    <Button
                      onClick={() => setShowCreateDeploymentDialog(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Deployment
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              deployments.map((deployment) => {
                const StatusIcon = getStatusIcon(deployment.status);
                return (
                  <Card key={deployment.id} className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-xl ${getStatusColor(deployment.status)}`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{deployment.name}</h3>
                            <p className="text-sm text-gray-600">
                              Version {deployment.version} •
                              <code className="ml-1 bg-gray-100 px-2 py-0.5 rounded text-xs">{deployment.commitHash}</code>
                            </p>
                            {deployment.description && (
                              <p className="text-sm text-gray-500 mt-1">{deployment.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getEnvironmentColor(deployment.environment)} rounded-full`}>
                            {deployment.environment}
                          </Badge>
                          <Badge className={`${getStatusColor(deployment.status)} rounded-full`}>
                            {deployment.status}
                          </Badge>
                        </div>
                      </div>

                      {deployment.status === 'deploying' && deployment.progress && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Deployment Progress</span>
                            <span>{deployment.progress}%</span>
                          </div>
                          <Progress value={deployment.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <GitBranch className="w-3 h-3" />
                            <span>{deployment.branch || 'main'}</span>
                          </div>
                          {deployment.deployedAt && (
                            <span>Deployed {deployment.deployedAt}</span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {userRole === 'admin' && (
                            <>
                              <Button variant="outline" size="sm" className="rounded-xl">
                                <Play className="w-3 h-3 mr-1" />
                                Deploy
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-xl text-orange-600 hover:bg-orange-50">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Rollback
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" className="rounded-xl">
                            <Activity className="w-3 h-3 mr-1" />
                            Logs
                          </Button>
                          {(userRole === 'admin' || userRole === 'employee') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => {
                                  setSelectedDeployment(deployment);
                                  setDeploymentForm({
                                    name: deployment.name,
                                    environment: deployment.environment,
                                    version: deployment.version,
                                    branch: deployment.branch || '',
                                    commitHash: deployment.commitHash || '',
                                    description: deployment.description || '',
                                    status: deployment.status || 'PENDING',
                                    health: deployment.health || 'UNKNOWN'
                                  });
                                  setShowEditDeploymentDialog(true);
                                }}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              {userRole === 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this deployment?')) {
                                      deleteDeployment(deployment.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Environments</h2>
              <p className="text-gray-600">Manage deployment environments</p>
            </div>
            {(userRole === 'admin' || userRole === 'employee') && (
              <Dialog open={showCreateEnvironmentDialog} onOpenChange={setShowCreateEnvironmentDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    New Environment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Environment</DialogTitle>
                    <DialogDescription>
                      Add a new environment for deployments.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    createEnvironment(environmentForm);
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="env-name">Environment Name</Label>
                      <Input
                        id="env-name"
                        value={environmentForm.name}
                        onChange={(e) => setEnvironmentForm({ ...environmentForm, name: e.target.value })}
                        placeholder="e.g., Production"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="env-url">URL</Label>
                      <Input
                        id="env-url"
                        value={environmentForm.url}
                        onChange={(e) => setEnvironmentForm({ ...environmentForm, url: e.target.value })}
                        placeholder="e.g., https://app.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="env-description">Description</Label>
                      <Textarea
                        id="env-description"
                        value={environmentForm.description}
                        onChange={(e) => setEnvironmentForm({ ...environmentForm, description: e.target.value })}
                        placeholder="Brief description of the environment"
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowCreateEnvironmentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                        Create Environment
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* Edit Environment Dialog */}
            {userRole === 'admin' && (
              <Dialog open={showEditEnvironmentDialog} onOpenChange={setShowEditEnvironmentDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Environment</DialogTitle>
                    <DialogDescription>
                      Update environment information.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedEnvironment) {
                      updateEnvironment(selectedEnvironment.id, environmentForm);
                    }
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-env-name">Environment Name</Label>
                      <Input
                        id="edit-env-name"
                        value={environmentForm.name}
                        onChange={(e) => setEnvironmentForm({ ...environmentForm, name: e.target.value })}
                        placeholder="e.g., Production"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-env-url">URL</Label>
                      <Input
                        id="edit-env-url"
                        value={environmentForm.url}
                        onChange={(e) => setEnvironmentForm({ ...environmentForm, url: e.target.value })}
                        placeholder="e.g., https://app.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-env-description">Description</Label>
                      <Textarea
                        id="edit-env-description"
                        value={environmentForm.description}
                        onChange={(e) => setEnvironmentForm({ ...environmentForm, description: e.target.value })}
                        placeholder="Brief description of the environment"
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditEnvironmentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                        Update Environment
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {environments.map((env, index) => {
              const StatusIcon = getStatusIcon(env.status);
              return (
                <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{env.name}</CardTitle>
                      <Badge className={`${getStatusColor(env.status)} rounded-full`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {env.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl font-bold text-gray-900">{env.deployments}</div>
                      <div className="text-sm text-gray-600">Active Deployments</div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">Last update {env.lastUpdate}</p>
                    {userRole === 'admin' && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl"
                          onClick={() => {
                            setSelectedEnvironment(env);
                            setEnvironmentForm({
                              name: env.name,
                              description: env.description || '',
                              url: env.url || ''
                            });
                            setShowEditEnvironmentDialog(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 rounded-xl text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this environment?')) {
                              deleteEnvironment(env.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-emerald-600" />
                <span>Deployment History</span>
              </CardTitle>
              <CardDescription>Complete history of all deployments across environments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Deployment Analytics</h3>
                <p className="text-gray-600 mb-6">Detailed deployment metrics and performance insights</p>
                {userRole === 'admin' && (
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl">
                    View Analytics
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Deployment;
