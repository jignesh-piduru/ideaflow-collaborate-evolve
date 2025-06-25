import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Database,
  GitBranch,
  History,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';

interface DatabaseTrackerProps {
  userRole: 'admin' | 'employee';
  employeeId?: string;
}

interface Schema {
  id: number;
  name: string;
  version: string;
  status: 'approved' | 'created' | 'pending' | 'rejected';
  lastModified: string;
  tablesCount: number;
  migrationsCount: number;
  migrationsJson: string;
}

interface Migration {
  status: string;
  version: string;
  executedAt: string;
  description: string;
  rollbackAvailable: boolean;
}

interface ApiResponse {
  content: Schema[];
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

interface SchemaFormData {
  name: string;
  version: string;
  status: 'created' | 'pending' | 'approved' | 'rejected';
  lastModified: string;
  tablesCount: number;
  migrationsCount: number;
  migrationsJson: string;
}

const DatabaseTracker = ({ userRole, employeeId }: DatabaseTrackerProps) => {
  const [activeTab, setActiveTab] = useState('schemas');
  const [showNewSchemaDialog, setShowNewSchemaDialog] = useState(false);
  const [showEditSchemaDialog, setShowEditSchemaDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [schemaForm, setSchemaForm] = useState<SchemaFormData>({
    name: '',
    version: '',
    status: 'created',
    lastModified: new Date().toISOString().split('T')[0],
    tablesCount: 0,
    migrationsCount: 0,
    migrationsJson: '[]'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSchemas();
  }, []);

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      let url = `http://localhost:8081/api/database-trackers?page=0&size=10&sort=lastModified&direction=desc&_t=${timestamp}`;
      if (employeeId) {
        url += `&employeeId=${employeeId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch schemas:', response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch schemas: ${response.status} ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      console.log('Fetched schemas:', data.content); // Debug log
      setSchemas(data.content || []);
    } catch (error) {
      console.error('Error fetching schemas:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch schemas. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate JSON
  const validateMigrationsJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  };

  const handleSchemaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate migrations JSON
    if (!validateMigrationsJson(schemaForm.migrationsJson)) {
      toast({
        title: "Error",
        description: "Migrations JSON must be a valid JSON array.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        name: schemaForm.name,
        version: schemaForm.version,
        status: schemaForm.status,
        lastModified: schemaForm.lastModified,
        tablesCount: schemaForm.tablesCount,
        migrationsCount: schemaForm.migrationsCount,
        migrationsJson: schemaForm.migrationsJson
      };

      console.log('Creating schema with data:', requestBody); // Debug log

      let url = 'http://localhost:8081/api/database-trackers';
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, response.statusText, errorText);
        throw new Error(`Failed to create schema: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Schema created successfully:', result); // Debug log

      toast({
        title: "Success",
        description: "New schema created successfully!",
      });
      setShowNewSchemaDialog(false);
      setSchemaForm({
        name: '',
        version: '',
        status: 'created',
        lastModified: new Date().toISOString().split('T')[0],
        tablesCount: 0,
        migrationsCount: 0,
        migrationsJson: '[]'
      });

      // Refresh the schemas list to show the new schema
      console.log('Refreshing schemas list...'); // Debug log
      await fetchSchemas();
    } catch (error) {
      console.error('Error creating schema:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create schema. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSchema = (schema: Schema) => {
    setSelectedSchema(schema);
    setSchemaForm({
      name: schema.name,
      version: schema.version,
      status: schema.status as any,
      lastModified: schema.lastModified,
      tablesCount: schema.tablesCount,
      migrationsCount: schema.migrationsCount,
      migrationsJson: schema.migrationsJson || '[]'
    });
    setShowEditSchemaDialog(true);
  };

  const handleUpdateSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchema) return;

    setIsLoading(true);

    // Validate migrations JSON
    if (!validateMigrationsJson(schemaForm.migrationsJson)) {
      toast({
        title: "Error",
        description: "Migrations JSON must be a valid JSON array.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        name: schemaForm.name,
        version: schemaForm.version,
        status: schemaForm.status,
        lastModified: schemaForm.lastModified,
        tablesCount: schemaForm.tablesCount,
        migrationsCount: schemaForm.migrationsCount,
        migrationsJson: schemaForm.migrationsJson
      };

      console.log('Updating schema with data:', requestBody);

      let url = `http://localhost:8081/api/database-trackers/${selectedSchema.id}`;
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, response.statusText, errorText);
        throw new Error(`Failed to update schema: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Schema updated successfully:', result);

      toast({
        title: "Success",
        description: "Schema updated successfully!",
      });
      setShowEditSchemaDialog(false);
      setSelectedSchema(null);
      setSchemaForm({
        name: '',
        version: '',
        status: 'created',
        lastModified: new Date().toISOString().split('T')[0],
        tablesCount: 0,
        migrationsCount: 0,
        migrationsJson: '[]'
      });

      await fetchSchemas();
    } catch (error) {
      console.error('Error updating schema:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update schema. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchema = async () => {
    if (!selectedSchema) return;

    setIsLoading(true);

    try {
      console.log('Deleting schema:', selectedSchema.id);

      let url = `http://localhost:8081/api/database-trackers/${selectedSchema.id}`;
      if (employeeId) {
        url += `?employeeId=${employeeId}`;
      }
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, response.statusText, errorText);
        throw new Error(`Failed to delete schema: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('Schema deleted successfully');

      toast({
        title: "Success",
        description: "Schema deleted successfully!",
      });
      setShowDeleteDialog(false);
      setSelectedSchema(null);

      await fetchSchemas();
    } catch (error) {
      console.error('Error deleting schema:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete schema. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return CheckCircle;
      case 'PENDING': return Clock;
      case 'DRAFT': return AlertCircle;
      case 'REJECTED': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Database Tracker</h1>
          <p className="text-lg text-gray-600">Monitor database schemas, migrations, and version control</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={fetchSchemas}
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
          {userRole === 'admin' && (
            <Dialog open={showNewSchemaDialog} onOpenChange={setShowNewSchemaDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Schema
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Schema</DialogTitle>
                  <DialogDescription>
                    Add a new database schema to track. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSchemaSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Schema Name</Label>
                      <Input
                        id="name"
                        value={schemaForm.name}
                        onChange={(e) => setSchemaForm({ ...schemaForm, name: e.target.value })}
                        placeholder="e.g., users"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={schemaForm.version}
                        onChange={(e) => setSchemaForm({ ...schemaForm, version: e.target.value })}
                        placeholder="e.g., v2.1.0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={schemaForm.status} onValueChange={(value: any) => setSchemaForm({ ...schemaForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastModified">Last Modified Date</Label>
                    <Input
                      id="lastModified"
                      type="date"
                      value={schemaForm.lastModified}
                      onChange={(e) => setSchemaForm({ ...schemaForm, lastModified: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tablesCount">Tables Count</Label>
                      <Input
                        id="tablesCount"
                        type="number"
                        min="0"
                        value={schemaForm.tablesCount}
                        onChange={(e) => setSchemaForm({ ...schemaForm, tablesCount: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="migrationsCount">Migrations Count</Label>
                      <Input
                        id="migrationsCount"
                        type="number"
                        min="0"
                        value={schemaForm.migrationsCount}
                        onChange={(e) => setSchemaForm({ ...schemaForm, migrationsCount: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 3"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="migrationsJson">Migrations JSON</Label>
                    <Textarea
                      id="migrationsJson"
                      value={schemaForm.migrationsJson}
                      onChange={(e) => setSchemaForm({ ...schemaForm, migrationsJson: e.target.value })}
                      placeholder='[{"version":"v2.1.0","description":"Add user preferences table","status":"completed","executedAt":"2024-01-15T10:30:00"}]'
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Enter migration data as JSON array. Leave as [] for no migrations.
                    </p>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Schema'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Edit Schema Dialog */}
          <Dialog open={showEditSchemaDialog} onOpenChange={setShowEditSchemaDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Schema</DialogTitle>
                <DialogDescription>
                  Update the schema details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateSchema} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Schema Name</Label>
                    <Input
                      id="edit-name"
                      value={schemaForm.name}
                      onChange={(e) => setSchemaForm({ ...schemaForm, name: e.target.value })}
                      placeholder="e.g., users"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-version">Version</Label>
                    <Input
                      id="edit-version"
                      value={schemaForm.version}
                      onChange={(e) => setSchemaForm({ ...schemaForm, version: e.target.value })}
                      placeholder="e.g., v2.1.0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={schemaForm.status} onValueChange={(value: any) => setSchemaForm({ ...schemaForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-lastModified">Last Modified Date</Label>
                  <Input
                    id="edit-lastModified"
                    type="date"
                    value={schemaForm.lastModified}
                    onChange={(e) => setSchemaForm({ ...schemaForm, lastModified: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tablesCount">Tables Count</Label>
                    <Input
                      id="edit-tablesCount"
                      type="number"
                      min="0"
                      value={schemaForm.tablesCount}
                      onChange={(e) => setSchemaForm({ ...schemaForm, tablesCount: parseInt(e.target.value) || 0 })}
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-migrationsCount">Migrations Count</Label>
                    <Input
                      id="edit-migrationsCount"
                      type="number"
                      min="0"
                      value={schemaForm.migrationsCount}
                      onChange={(e) => setSchemaForm({ ...schemaForm, migrationsCount: parseInt(e.target.value) || 0 })}
                      placeholder="e.g., 3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-migrationsJson">Migrations JSON</Label>
                  <Textarea
                    id="edit-migrationsJson"
                    value={schemaForm.migrationsJson}
                    onChange={(e) => setSchemaForm({ ...schemaForm, migrationsJson: e.target.value })}
                    placeholder='[{"version":"v2.1.0","description":"Add user preferences table","status":"completed","executedAt":"2024-01-15T10:30:00"}]'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Enter migration data as JSON array. Leave as [] for no migrations.
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Schema'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Schema</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the schema "{selectedSchema?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSchema}
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete Schema'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="schemas" className="rounded-xl">Database Schemas</TabsTrigger>
          <TabsTrigger value="migrations" className="rounded-xl">Migration History</TabsTrigger>
          <TabsTrigger value="versions" className="rounded-xl">Version Control</TabsTrigger>
        </TabsList>

        <TabsContent value="schemas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="h-8 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="h-8 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded w-8"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : schemas.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schemas found</h3>
                <p className="text-gray-600 mb-6">Create your first database schema to get started</p>
                {(userRole === 'admin' || userRole === 'employee') && (
                  <Button
                    onClick={() => setShowNewSchemaDialog(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Schema
                  </Button>
                )}
              </div>
            ) : (
              schemas.map((schema) => {
              const StatusIcon = getStatusIcon(schema.status);
              return (
                <Card key={schema.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Database className="w-6 h-6 text-blue-600" />
                        <CardTitle className="text-lg">{schema.name}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(schema.status)} rounded-full px-3 py-1`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {schema.status.replace('_', ' ')}
                        </Badge>
                        {userRole === 'admin' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditSchema(schema)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSchema(schema);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-sm text-gray-500">
                      Version {schema.version} • Modified {schema.lastModified}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-900">{schema.tablesCount}</div>
                        <div className="text-sm text-gray-600">Tables</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-900">{schema.migrationsCount}</div>
                        <div className="text-sm text-gray-600">Migrations</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                        <GitBranch className="w-3 h-3 mr-1" />
                        Branch
                      </Button>
                      {userRole === 'admin' && schema.status === 'approved' && (
                        <Button variant="outline" size="sm" className="rounded-xl text-orange-600 hover:bg-orange-50">
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="migrations" className="space-y-6">
          <div className="space-y-4">
            {schemas.flatMap(schema => {
              try {
                const migrations: Migration[] = JSON.parse(schema.migrationsJson || '[]');
                return migrations.map((migration, index) => {
                  const StatusIcon = getStatusIcon(migration.status);
                  return (
                    <Card key={`${schema.id}-${index}`} className="rounded-2xl shadow-lg border-0 bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-xl ${getStatusColor(migration.status)}`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{migration.description}</h3>
                              <p className="text-sm text-gray-600">Version {migration.version} • {new Date(migration.executedAt).toLocaleString()} • Schema: {schema.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(migration.status)} rounded-full`}>
                              {migration.status}
                            </Badge>
                            {userRole === 'admin' && migration.rollbackAvailable && (
                              <Button variant="outline" size="sm" className="rounded-xl text-orange-600 hover:bg-orange-50">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Rollback
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              } catch (error) {
                console.error('Failed to parse migrations JSON for schema:', schema.name, error);
                return [];
              }
            })}
            {schemas.every(schema => {
              try {
                const migrations = JSON.parse(schema.migrationsJson || '[]');
                return migrations.length === 0;
              } catch {
                return true;
              }
            }) && (
              <Card className="rounded-2xl shadow-lg border-0 bg-white">
                <CardContent className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No migrations found</h3>
                  <p className="text-gray-600">Migration history will appear here once schemas have migrations.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-600" />
                <span>Version History</span>
              </CardTitle>
              <CardDescription>Track all database version changes and maintain rollback capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Version Control Coming Soon</h3>
                <p className="text-gray-600 mb-6">Advanced version control features with Git integration</p>
                {userRole === 'admin' && (
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl">
                    Enable Version Control
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

export default DatabaseTracker;

