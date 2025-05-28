
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter
} from 'lucide-react';

interface DatabaseTrackerProps {
  userRole: 'admin' | 'employee';
}

const DatabaseTracker = ({ userRole }: DatabaseTrackerProps) => {
  const [activeTab, setActiveTab] = useState('schemas');

  const schemas = [
    {
      id: 1,
      name: 'users',
      version: 'v2.1.0',
      status: 'approved',
      lastModified: '2024-01-15',
      tables: 5,
      migrations: 3
    },
    {
      id: 2,
      name: 'products',
      version: 'v1.8.2',
      status: 'in_review',
      lastModified: '2024-01-14',
      tables: 8,
      migrations: 2
    },
    {
      id: 3,
      name: 'orders',
      version: 'v3.0.0',
      status: 'created',
      lastModified: '2024-01-13',
      tables: 12,
      migrations: 5
    }
  ];

  const migrations = [
    {
      id: 1,
      version: 'v2.1.0',
      description: 'Add user preferences table',
      status: 'completed',
      executedAt: '2024-01-15 10:30:00',
      rollbackAvailable: true
    },
    {
      id: 2,
      version: 'v2.0.9',
      description: 'Update product categories schema',
      status: 'completed',
      executedAt: '2024-01-14 15:45:00',
      rollbackAvailable: true
    },
    {
      id: 3,
      version: 'v2.0.8',
      description: 'Create audit log tables',
      status: 'failed',
      executedAt: '2024-01-13 09:15:00',
      rollbackAvailable: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': case 'completed': return CheckCircle;
      case 'in_review': return Clock;
      case 'created': return AlertCircle;
      case 'failed': return AlertCircle;
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
          <Button variant="outline" className="rounded-2xl">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {userRole === 'admin' && (
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Schema
            </Button>
          )}
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
            {schemas.map((schema) => {
              const StatusIcon = getStatusIcon(schema.status);
              return (
                <Card key={schema.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Database className="w-6 h-6 text-blue-600" />
                        <CardTitle className="text-lg">{schema.name}</CardTitle>
                      </div>
                      <Badge className={`${getStatusColor(schema.status)} rounded-full px-3 py-1`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {schema.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-gray-500">
                      Version {schema.version} • Modified {schema.lastModified}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-900">{schema.tables}</div>
                        <div className="text-sm text-gray-600">Tables</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-2xl font-bold text-gray-900">{schema.migrations}</div>
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
            })}
          </div>
        </TabsContent>

        <TabsContent value="migrations" className="space-y-6">
          <div className="space-y-4">
            {migrations.map((migration) => {
              const StatusIcon = getStatusIcon(migration.status);
              return (
                <Card key={migration.id} className="rounded-2xl shadow-lg border-0 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-xl ${getStatusColor(migration.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{migration.description}</h3>
                          <p className="text-sm text-gray-600">Version {migration.version} • {migration.executedAt}</p>
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
            })}
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
