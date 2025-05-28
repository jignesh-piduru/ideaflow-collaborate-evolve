
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  GitBranch, 
  Server, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Plus,
  Search,
  Filter,
  Play,
  RotateCcw,
  Settings,
  Activity
} from 'lucide-react';

interface DeploymentProps {
  userRole: 'admin' | 'employee';
}

const Deployment = ({ userRole }: DeploymentProps) => {
  const [activeTab, setActiveTab] = useState('pipelines');

  const deployments = [
    {
      id: 1,
      name: 'Frontend Application',
      environment: 'production',
      status: 'deployed',
      version: 'v2.1.0',
      deployedAt: '2024-01-15 14:30:00',
      branch: 'main',
      commitHash: 'abc123f',
      health: 'healthy'
    },
    {
      id: 2,
      name: 'API Service',
      environment: 'staging',
      status: 'deploying',
      version: 'v1.8.2',
      deployedAt: null,
      branch: 'develop',
      commitHash: 'def456g',
      health: 'unknown',
      progress: 65
    },
    {
      id: 3,
      name: 'Database Migration',
      environment: 'development',
      status: 'failed',
      version: 'v3.0.0',
      deployedAt: '2024-01-14 09:15:00',
      branch: 'feature/new-schema',
      commitHash: 'ghi789h',
      health: 'unhealthy'
    }
  ];

  const environments = [
    { name: 'Development', status: 'active', deployments: 12, lastUpdate: '2 hours ago' },
    { name: 'Staging', status: 'active', deployments: 8, lastUpdate: '4 hours ago' },
    { name: 'UAT', status: 'maintenance', deployments: 5, lastUpdate: '1 day ago' },
    { name: 'Production', status: 'active', deployments: 3, lastUpdate: '6 hours ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': case 'healthy': return 'bg-green-100 text-green-800';
      case 'deploying': return 'bg-blue-100 text-blue-800';
      case 'failed': case 'unhealthy': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': case 'healthy': return CheckCircle;
      case 'deploying': return Clock;
      case 'failed': case 'unhealthy': return AlertCircle;
      default: return Clock;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'development': return 'bg-blue-100 text-blue-800';
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
          <Button variant="outline" className="rounded-2xl">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {userRole === 'admin' && (
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Deployment
            </Button>
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
            {deployments.map((deployment) => {
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
                          <span>{deployment.branch}</span>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-6">
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
                      <Button variant="outline" className="w-full rounded-xl">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
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
