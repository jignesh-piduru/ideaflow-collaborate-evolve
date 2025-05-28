
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Zap
} from 'lucide-react';

interface ApiDevelopmentProps {
  userRole: 'admin' | 'employee';
}

const ApiDevelopment = ({ userRole }: ApiDevelopmentProps) => {
  const [activeTab, setActiveTab] = useState('endpoints');
  const [testResponse, setTestResponse] = useState('');

  const endpoints = [
    {
      id: 1,
      name: 'User Authentication',
      method: 'POST',
      path: '/api/auth/login',
      status: 'completed',
      version: 'v1.2.0',
      lastTested: '2024-01-15',
      responseTime: '120ms'
    },
    {
      id: 2,
      name: 'Get User Profile',
      method: 'GET',
      path: '/api/users/{id}',
      status: 'in_progress',
      version: 'v1.1.0',
      lastTested: '2024-01-14',
      responseTime: '95ms'
    },
    {
      id: 3,
      name: 'Create Order',
      method: 'POST',
      path: '/api/orders',
      status: 'not_started',
      version: 'v1.0.0',
      lastTested: null,
      responseTime: null
    }
  ];

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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'not_started': return AlertCircle;
      default: return Clock;
    }
  };

  const handleTestApi = () => {
    setTestResponse(`{
  "status": "success",
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "timestamp": "${new Date().toISOString()}"
}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Development</h1>
          <p className="text-lg text-gray-600">Document, test, and manage your APIs with integrated testing tools</p>
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
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Endpoint
            </Button>
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
            {endpoints.map((endpoint) => {
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(endpoint.status)} rounded-full`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {endpoint.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Play className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <FileText className="w-3 h-3 mr-1" />
                          Docs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                    <select className="px-3 py-2 border rounded-xl bg-white text-sm font-mono">
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                    <Input 
                      placeholder="https://api.example.com/endpoint" 
                      className="flex-1 rounded-xl font-mono text-sm"
                    />
                  </div>
                  <Textarea 
                    placeholder="Request body (JSON)"
                    className="min-h-[120px] rounded-xl font-mono text-sm"
                  />
                  <Button onClick={handleTestApi} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
                    <Play className="w-4 h-4 mr-2" />
                    Send Request
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
    </div>
  );
};

export default ApiDevelopment;
