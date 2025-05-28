
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  Download, 
  Import, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Search,
  Filter,
  Shield,
  Eye,
  Archive,
  Sparkles
} from 'lucide-react';

interface EvidenceProps {
  userRole: 'admin' | 'employee';
}

const Evidence = ({ userRole }: EvidenceProps) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [uploading, setUploading] = useState(false);

  const evidenceItems = [
    {
      id: 1,
      name: 'API Integration Screenshots',
      type: 'image',
      category: 'development',
      status: 'validated',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-01-15',
      size: '2.4 MB',
      tags: ['api', 'integration', 'testing']
    },
    {
      id: 2,
      name: 'Database Schema Documentation',
      type: 'pdf',
      category: 'database',
      status: 'pending',
      uploadedBy: 'Sarah Smith',
      uploadedAt: '2024-01-14',
      size: '1.8 MB',
      tags: ['database', 'schema', 'documentation']
    },
    {
      id: 3,
      name: 'Deployment Logs',
      type: 'text',
      category: 'deployment',
      status: 'validated',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-13',
      size: '856 KB',
      tags: ['deployment', 'logs', 'production']
    }
  ];

  const categories = [
    { name: 'Development', count: 24, color: 'bg-blue-100 text-blue-800' },
    { name: 'Database', count: 18, color: 'bg-green-100 text-green-800' },
    { name: 'Deployment', count: 12, color: 'bg-purple-100 text-purple-800' },
    { name: 'Testing', count: 8, color: 'bg-yellow-100 text-yellow-800' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return Clock;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'pdf': return '📄';
      case 'text': return '📝';
      case 'video': return '🎥';
      default: return '📁';
    }
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting evidence...');
  };

  const handleImport = () => {
    // Import functionality
    console.log('Importing evidence...');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Evidence Vault</h1>
          <p className="text-lg text-gray-600">Secure document management with AI-powered categorization and validation</p>
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
          <Button onClick={handleImport} variant="outline" className="rounded-2xl bg-blue-50 hover:bg-blue-100">
            <Import className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleExport} variant="outline" className="rounded-2xl bg-green-50 hover:bg-green-100">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="documents" className="rounded-xl">Evidence Documents</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl">Categories</TabsTrigger>
          <TabsTrigger value="vault" className="rounded-xl">Secure Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="space-y-4">
            {evidenceItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              return (
                <Card key={item.id} className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{getTypeIcon(item.type)}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            Uploaded by {item.uploadedBy} on {item.uploadedAt} • {item.size}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="rounded-full text-xs">
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(item.status)} rounded-full`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {item.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge className={`${category.color} rounded-full`}>
                      {category.count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{category.count}</div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 rounded-xl">
                    <Archive className="w-3 h-3 mr-1" />
                    Browse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vault" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Secure Storage</span>
                </CardTitle>
                <CardDescription>Enterprise-grade security with end-to-end encryption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-green-900">Encryption Status</div>
                    <div className="text-sm text-green-700">AES-256 Enabled</div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div>
                    <div className="font-semibold text-blue-900">Backup Status</div>
                    <div className="text-sm text-blue-700">Auto-backup Active</div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>AI Features</span>
                </CardTitle>
                <CardDescription>Premium AI-powered document analysis and categorization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="font-semibold text-purple-900 mb-2">Auto-Labeling</div>
                  <div className="text-sm text-purple-700 mb-3">AI automatically categorizes and tags uploaded documents</div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                    Enable AI Labeling
                  </Button>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="font-semibold text-orange-900 mb-2">Smart Validation</div>
                  <div className="text-sm text-orange-700 mb-3">Timestamp validation and authenticity verification</div>
                  <Button size="sm" variant="outline" className="rounded-xl">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Evidence;
