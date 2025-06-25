import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  Code,
  Play,
  FileText,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Copy,
  Download,
  Zap,
  Edit,
  Trash2,
  RefreshCw,
  History,
  Eye
} from 'lucide-react';

interface ApiDevelopmentProps {
  userRole: 'admin' | 'employee';
  employeeId?: string;
}

interface Endpoint {
  id: number;
  name: string;
  method: string;
  path: string;
  description?: string;
  status: 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS';
  version: string;
  lastTested?: string;
  responseTime?: string;
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

interface TestLog {
  id: number;
  endpointId: number;
  method: string;
  url: string;
  requestBody?: string;
  responseBody?: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  success: boolean;
}

interface EndpointFormData {
  name: string;
  method: string;
  path: string;
  description: string;
  version: string;
  status?: 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS';
}

const ApiDevelopment = ({ userRole, employeeId }: ApiDevelopmentProps) => {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [testLogs, setTestLogs] = useState<TestLog[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTestLogsDialog, setShowTestLogsDialog] = useState(false);
  const [testResponse, setTestResponse] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [testMethod, setTestMethod] = useState('GET');
  const [testBody, setTestBody] = useState('');
  const { toast } = useToast();

  const [endpointForm, setEndpointForm] = useState<EndpointFormData>({
    name: '',
    method: 'GET',
    path: '',
    description: '',
    version: 'v1.0.0',
    status: 'NOT_STARTED'
  });

  useEffect(() => {
    fetchEndpoints();
  }, []);

  // API Functions
  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      console.log('Fetching endpoints from /api/endpoints with pagination');
      let url = '/api/endpoints?page=0&size=20&sort=createdAt&direction=desc';
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      const response = await fetch(url);
      console.log('Fetch response status:', response.status);
      console.log('Response URL:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch error response:', errorText);
        throw new Error(`Failed to fetch endpoints: ${response.status} - ${errorText}`);
      }

      const data: ApiResponse<Endpoint> = await response.json();
      console.log('Fetched endpoints data:', data);

      // Extract content from paginated response
      setEndpoints(data.content || []);
    } catch (error) {
      console.error('Error fetching endpoints:', error);

      console.error('Error fetching endpoints:', error);
      setEndpoints([]); // Set empty array on error

      toast({
        title: "Error",
        description: "Failed to fetch endpoints. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEndpoint = async (endpointData: EndpointFormData) => {
    try {
      console.log('Creating endpoint with data:', endpointData);

      // Prepare the request body to match your API structure
      const requestBody = {
        name: endpointData.name,
        method: endpointData.method,
        path: endpointData.path,
        description: endpointData.description,
        version: endpointData.version,
        status: endpointData.status || 'NOT_STARTED', // Use form status or default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let url = '/api/endpoints';
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to create endpoint: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Endpoint created successfully:', result);

      toast({
        title: "Success",
        description: "Endpoint created successfully!",
      });

      setShowCreateDialog(false);
      setEndpointForm({
        name: '',
        method: 'GET',
        path: '',
        description: '',
        version: 'v1.0.0',
        status: 'NOT_STARTED'
      });
      fetchEndpoints();
    } catch (error) {
      console.error('Error creating endpoint:', error);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create endpoint. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateEndpoint = async (id: number, endpointData: EndpointFormData) => {
    try {
      console.log('Updating endpoint with ID:', id, 'Data:', endpointData);

      // Prepare the request body to match your API structure
      const requestBody = {
        name: endpointData.name,
        method: endpointData.method,
        path: endpointData.path,
        description: endpointData.description,
        version: endpointData.version,
        status: endpointData.status || 'IN_PROGRESS', // Use form status or default to IN_PROGRESS when editing
        updatedAt: new Date().toISOString()
      };

      let url = `/api/endpoints/${id}`;
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error response:', errorText);
        throw new Error(`Failed to update endpoint: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Endpoint updated successfully:', result);

      toast({
        title: "Success",
        description: "Endpoint updated successfully!",
      });

      setShowEditDialog(false);
      setSelectedEndpoint(null);
      fetchEndpoints();
    } catch (error) {
      console.error('Error updating endpoint:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update endpoint. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteEndpoint = async (id: number) => {
    try {
      console.log('Deleting endpoint with ID:', id);

      let url = `/api/endpoints/${id}`;
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        throw new Error(`Failed to delete endpoint: ${response.status} - ${errorText}`);
      }

      console.log('Endpoint deleted successfully');

      toast({
        title: "Success",
        description: "Endpoint deleted successfully!",
      });

      fetchEndpoints();
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete endpoint. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchTestLogs = async (endpointId: number) => {
    try {
      console.log('Fetching test logs for endpoint ID:', endpointId);

      let url = `/api/test-logs/endpoint/${endpointId}`;
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url);
      console.log('Test logs response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test logs error response:', errorText);
        throw new Error(`Failed to fetch test logs: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched test logs:', data);

      // Handle both direct array and paginated response
      const logsArray = data.content ? data.content : (Array.isArray(data) ? data : []);
      setTestLogs(logsArray);
    } catch (error) {
      console.error('Error fetching test logs:', error);

      // Set empty array and show user-friendly message
      setTestLogs([]);

      if (error instanceof Error && error.message.includes('404')) {
        toast({
          title: "No Test Logs",
          description: "No test logs found for this endpoint, or the test logs API is not implemented yet.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch test logs. Please try again later.",
          variant: "destructive"
        });
      }
    }
  };

  const testEndpoint = async () => {
    try {
      setTestLoading(true);
      const startTime = Date.now();

      const requestOptions: RequestInit = {
        method: testMethod,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (testMethod !== 'GET' && testBody) {
        requestOptions.body = testBody;
      }

      const response = await fetch(testUrl, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const responseText = await response.text();
      let responseJson: any;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = responseText;
      }

      const testResult = {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseJson
      };

      setTestResponse(JSON.stringify(testResult, null, 2));

      toast({
        title: "Test Completed",
        description: `Request completed in ${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error testing endpoint:', error);
      setTestResponse(JSON.stringify({
        error: 'Failed to test endpoint',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, null, 2));

      toast({
        title: "Test Failed",
        description: "Failed to test endpoint. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle;
      case 'IN_PROGRESS': return Clock;
      case 'NOT_STARTED': return AlertCircle;
      default: return Clock;
    }
  };

  // Quick status update function
  const updateEndpointStatus = async (endpointId: number, newStatus: 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS') => {
    try {
      let url = `http://localhost:8081/api/endpoints/${endpointId}`;
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update status: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      // Refresh the endpoints list
      await fetchEndpoints();

      toast({
        title: "Success",
        description: `Endpoint status updated to ${newStatus.replace('_', ' ').toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating endpoint status:', error);
      toast({
        title: "Error",
        description: "Failed to update endpoint status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Development</h1>
          <p className="text-lg text-gray-600">Document, test, and manage your APIs with integrated testing tools</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={fetchEndpoints}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Endpoint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Endpoint</DialogTitle>
                  <DialogDescription>
                    Add a new API endpoint to track and test.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createEndpoint(endpointForm);
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Endpoint Name</Label>
                    <Input
                      id="name"
                      value={endpointForm.name}
                      onChange={(e) => setEndpointForm({ ...endpointForm, name: e.target.value })}
                      placeholder="e.g., User Authentication"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="method">Method</Label>
                      <Select value={endpointForm.method} onValueChange={(value) => setEndpointForm({ ...endpointForm, method: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={endpointForm.version}
                        onChange={(e) => setEndpointForm({ ...endpointForm, version: e.target.value })}
                        placeholder="v1.0.0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={endpointForm.status} onValueChange={(value: any) => setEndpointForm({ ...endpointForm, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="path">Path</Label>
                    <Input
                      id="path"
                      value={endpointForm.path}
                      onChange={(e) => setEndpointForm({ ...endpointForm, path: e.target.value })}
                      placeholder="/api/users/{id}"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={endpointForm.description}
                      onChange={(e) => setEndpointForm({ ...endpointForm, description: e.target.value })}
                      placeholder="Brief description of the endpoint"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                      Create Endpoint
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
          <TabsTrigger value="endpoints" className="rounded-xl">API Endpoints</TabsTrigger>
          <TabsTrigger value="testing" className="rounded-xl">Live Testing</TabsTrigger>
          <TabsTrigger value="documentation" className="rounded-xl">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                          <div className="w-32 h-6 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div>
                          <div className="w-40 h-5 bg-gray-200 rounded mb-2"></div>
                          <div className="w-60 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                        <div className="w-16 h-8 bg-gray-200 rounded-xl"></div>
                        <div className="w-16 h-8 bg-gray-200 rounded-xl"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : endpoints.length === 0 ? (
              <Card className="rounded-2xl shadow-lg border-0 bg-white">
                <CardContent className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No endpoints found</h3>
                  <p className="text-gray-600 mb-6">Create your first API endpoint to get started</p>
                  {(userRole === 'admin' || userRole === 'employee') && (
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Endpoint
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              endpoints.map((endpoint) => {
                const StatusIcon = getStatusIcon(endpoint.status);
                return (
                  <Card key={endpoint.id} className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getMethodColor(endpoint.method)} rounded-full font-mono text-xs px-3 py-1`}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm bg-gray-100 px-3 py-1 rounded-lg font-mono">{endpoint.path}</code>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{endpoint.name}</h3>
                            <p className="text-sm text-gray-600">
                              Version {endpoint.version}
                              {endpoint.lastTested && ` • Last tested ${endpoint.lastTested}`}
                              {endpoint.responseTime && ` • ${endpoint.responseTime}`}
                            </p>
                            {endpoint.description && (
                              <p className="text-sm text-gray-500 mt-1">{endpoint.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(endpoint.status)} rounded-full`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {endpoint.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                              setTestUrl(`http://localhost:8080${endpoint.path}`);
                              setTestMethod(endpoint.method);
                              setActiveTab('testing');
                            }}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => {
                              fetchTestLogs(endpoint.id);
                              setSelectedEndpoint(endpoint);
                              setShowTestLogsDialog(true);
                            }}
                          >
                            <History className="w-3 h-3 mr-1" />
                            Logs
                          </Button>
                          {(userRole === 'admin' || userRole === 'employee') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => {
                                  setSelectedEndpoint(endpoint);
                                  setEndpointForm({
                                    name: endpoint.name,
                                    method: endpoint.method,
                                    path: endpoint.path,
                                    description: endpoint.description || '',
                                    version: endpoint.version,
                                    status: endpoint.status
                                  });
                                  setShowEditDialog(true);
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
                                    if (confirm('Are you sure you want to delete this endpoint?')) {
                                      deleteEndpoint(endpoint.id);
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

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span>API Testing Console</span>
                </CardTitle>
                <CardDescription>Test your APIs in real-time with live responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Select value={testMethod} onValueChange={setTestMethod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      placeholder="http://localhost:8080/api/endpoint"
                      className="flex-1 rounded-xl font-mono text-sm"
                    />
                  </div>
                  {testMethod !== 'GET' && (
                    <Textarea
                      value={testBody}
                      onChange={(e) => setTestBody(e.target.value)}
                      placeholder="Request body (JSON)"
                      className="min-h-[120px] rounded-xl font-mono text-sm"
                    />
                  )}
                  <Button
                    onClick={testEndpoint}
                    disabled={testLoading || !testUrl}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl"
                  >
                    {testLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {testLoading ? 'Testing...' : 'Send Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <span>Response</span>
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-xl text-sm font-mono overflow-auto max-h-[300px]">
                  {testResponse || "Response will appear here after testing an endpoint..."}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>API Documentation</span>
              </CardTitle>
              <CardDescription>Comprehensive API documentation with Swagger-like interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Documentation</h3>
                <p className="text-gray-600 mb-6">Auto-generated documentation with interactive testing capabilities</p>
                {userRole === 'admin' && (
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl">
                    Generate Documentation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Endpoint Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Endpoint</DialogTitle>
            <DialogDescription>
              Update the endpoint information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedEndpoint) {
              updateEndpoint(selectedEndpoint.id, endpointForm);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Endpoint Name</Label>
              <Input
                id="edit-name"
                value={endpointForm.name}
                onChange={(e) => setEndpointForm({ ...endpointForm, name: e.target.value })}
                placeholder="e.g., User Authentication"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-method">Method</Label>
                <Select value={endpointForm.method} onValueChange={(value) => setEndpointForm({ ...endpointForm, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-version">Version</Label>
                <Input
                  id="edit-version"
                  value={endpointForm.version}
                  onChange={(e) => setEndpointForm({ ...endpointForm, version: e.target.value })}
                  placeholder="v1.0.0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={endpointForm.status} onValueChange={(value: any) => setEndpointForm({ ...endpointForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-path">Path</Label>
              <Input
                id="edit-path"
                value={endpointForm.path}
                onChange={(e) => setEndpointForm({ ...endpointForm, path: e.target.value })}
                placeholder="/api/users/{id}"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={endpointForm.description}
                onChange={(e) => setEndpointForm({ ...endpointForm, description: e.target.value })}
                placeholder="Brief description of the endpoint"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                Update Endpoint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Test Logs Dialog */}
      <Dialog open={showTestLogsDialog} onOpenChange={setShowTestLogsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Logs - {selectedEndpoint?.name}</DialogTitle>
            <DialogDescription>
              View test history and responses for this endpoint.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {testLogs.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No test logs found</h3>
                <p className="text-gray-600">Test this endpoint to see logs appear here.</p>
              </div>
            ) : (
              testLogs.map((log) => (
                <Card key={log.id} className="rounded-xl border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getMethodColor(log.method)} rounded-full font-mono text-xs px-3 py-1`}>
                          {log.method}
                        </Badge>
                        <Badge className={log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {log.statusCode}
                        </Badge>
                        <span className="text-sm text-gray-600">{log.responseTime}ms</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-gray-700 mb-2">
                      {log.url}
                    </div>
                    {log.requestBody && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Request Body:</h4>
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.requestBody), null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.responseBody && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Response Body:</h4>
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto max-h-32">
                          {typeof log.responseBody === 'string' ? log.responseBody : JSON.stringify(log.responseBody, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiDevelopment;
