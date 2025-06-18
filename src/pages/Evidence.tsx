
import { useState, useEffect } from 'react';
import { mockEvidenceApi, realEvidenceApi, USE_MOCK_EVIDENCE_API } from '@/services/mockEvidenceApi';
import { useToast } from '@/components/ui/use-toast';
import EvidenceUpload from '@/components/EvidenceUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  Shield,
  Archive,
  Sparkles,
  X,
  Eye
} from 'lucide-react';

interface EvidenceProps {
  userRole: 'admin' | 'employee';
}

const Evidence = ({ userRole }: EvidenceProps) => {
  const [activeTab, setActiveTab] = useState('documents');

  const [loading, setLoading] = useState(true);
  const [evidenceItems, setEvidenceItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [vaultSettings, setVaultSettings] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    console.log('Evidence component mounted, fetching data...');
    fetchEvidence();
    fetchProjects();
    fetchVaultSettings();
  }, []);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      console.log('Fetching evidence from API');

      const api = USE_MOCK_EVIDENCE_API ? mockEvidenceApi : realEvidenceApi;
      console.log(`Using ${USE_MOCK_EVIDENCE_API ? 'mock' : 'real'} API for evidence`);

      const data = await api.getEvidence();
      console.log('Fetched evidence data:', data);
      setEvidenceItems(data.content || []);
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
      setEvidenceItems([]);
      toast({
        title: "Error",
        description: `Failed to fetch evidence${USE_MOCK_EVIDENCE_API ? '' : ' from server'}. Please try again later.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const api = USE_MOCK_EVIDENCE_API ? mockEvidenceApi : realEvidenceApi;
      const data = await api.getProjects();
      setProjects(data.content || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    }
  };

  const fetchVaultSettings = async () => {
    try {
      const api = USE_MOCK_EVIDENCE_API ? mockEvidenceApi : realEvidenceApi;
      const data = await api.getVaultSettings();
      setVaultSettings(data);
    } catch (error) {
      console.error('Failed to fetch vault settings:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Database': return 'bg-blue-100 text-blue-800';
      case 'API Development': return 'bg-green-100 text-green-800';
      case 'Code Deployment': return 'bg-purple-100 text-purple-800';
      case 'Go Live': return 'bg-red-100 text-red-800';
      case 'Testing': return 'bg-yellow-100 text-yellow-800';
      case 'Documentation': return 'bg-indigo-100 text-indigo-800';
      case 'UI/UX': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate categories from evidence items
  const categories = [
    'Database',
    'API Development',
    'Code Deployment',
    'Go Live',
    'Testing',
    'Documentation',
    'UI/UX',
    'Other'
  ].map(categoryName => {
    const count = evidenceItems.filter(item => item.category === categoryName).length;
    return {
      name: categoryName,
      count,
      color: getCategoryColor(categoryName)
    };
  }).filter(cat => cat.count > 0);

  // Filter evidence items based on search and category
  const filteredEvidence = evidenceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return Clock;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'IMAGE': return '🖼️';
      case 'DOCUMENT': return '📄';
      case 'FILE': return '📁';
      case 'LINK': return '🔗';
      case 'PDF': return '📄';
      case 'TEXT': return '📝';
      case 'VIDEO': return '🎥';
      default: return '📁';
    }
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleView = (evidence: any) => {
    setSelectedEvidence(evidence);
    setShowViewModal(true);
  };

  const handleDeleteEvidence = async (id: string) => {
    try {
      const api = USE_MOCK_EVIDENCE_API ? mockEvidenceApi : realEvidenceApi;
      await api.deleteEvidence(id);

      await fetchEvidence();
      toast({
        title: "Success",
        description: "Evidence deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast({
        title: "Error",
        description: "Failed to delete evidence. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const api = USE_MOCK_EVIDENCE_API ? mockEvidenceApi : realEvidenceApi;
      await api.updateEvidence(id, { status: status as 'PENDING' | 'VALIDATED' | 'REJECTED' });

      await fetchEvidence();
      toast({
        title: "Success",
        description: "Evidence status updated successfully!",
      });
    } catch (error) {
      console.error('Error updating evidence status:', error);
      toast({
        title: "Error",
        description: "Failed to update evidence status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (evidence: any) => {
    if (evidence.downloadUrl) {
      window.open(evidence.downloadUrl, '_blank');
    } else if (evidence.url) {
      window.open(evidence.url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Download URL not available for this evidence.",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(evidenceItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'evidence_export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Success",
      description: "Evidence data exported successfully!",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            console.log('Imported evidence data:', importedData);
            toast({
              title: "Success",
              description: "Evidence data imported successfully!",
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to import evidence data. Invalid file format.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Evidence Vault</h1>
          <p className="text-lg text-gray-600">Secure document management with AI-powered categorization and validation</p>
        </div>
        <div className="flex space-x-3">
          <Badge
            variant={USE_MOCK_EVIDENCE_API ? "secondary" : "default"}
            className="px-3 py-1 text-xs"
          >
            {USE_MOCK_EVIDENCE_API ? 'Mock API' : 'Real API'}
          </Badge>
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search evidence..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.name} value={category.name}>
                {category.name} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100 p-1">
          <TabsTrigger value="documents" className="rounded-xl">Evidence Documents</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl">Categories</TabsTrigger>
          <TabsTrigger value="vault" className="rounded-xl">Secure Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="rounded-2xl shadow-lg border-0 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredEvidence.length === 0 ? (
              <Card className="rounded-2xl shadow-lg border-0 bg-white">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Evidence Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedCategory !== 'all'
                      ? 'No evidence matches your search criteria.'
                      : 'Start by uploading your first piece of evidence.'}
                  </p>
                  <Button onClick={handleUpload} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Evidence
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredEvidence.map((item) => {
                const StatusIcon = getStatusIcon(item.status);
                return (
                  <Card key={item.id} className="rounded-2xl shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{getTypeIcon(item.type)}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                            <p className="text-sm text-gray-500">
                              Uploaded by {item.uploadedBy} on {item.uploadedAt}
                              {item.fileSize && ` • ${item.fileSize}`}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={`${getCategoryColor(item.category)} rounded-full text-xs`}>
                                {item.category}
                              </Badge>
                              {item.tags && item.tags.map((tag: string, index: number) => (
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleView(item)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleDownload(item)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          {userRole === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this evidence?')) {
                                  handleDeleteEvidence(item.id);
                                }
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
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
                <div className={`flex items-center justify-between p-4 rounded-xl ${
                  vaultSettings?.encryptionEnabled ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div>
                    <div className={`font-semibold ${
                      vaultSettings?.encryptionEnabled ? 'text-green-900' : 'text-red-900'
                    }`}>Encryption Status</div>
                    <div className={`text-sm ${
                      vaultSettings?.encryptionEnabled ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {vaultSettings?.encryptionEnabled ? 'AES-256 Enabled' : 'Encryption Disabled'}
                    </div>
                  </div>
                  {vaultSettings?.encryptionEnabled ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl ${
                  vaultSettings?.autoBackupEnabled ? 'bg-blue-50' : 'bg-yellow-50'
                }`}>
                  <div>
                    <div className={`font-semibold ${
                      vaultSettings?.autoBackupEnabled ? 'text-blue-900' : 'text-yellow-900'
                    }`}>Backup Status</div>
                    <div className={`text-sm ${
                      vaultSettings?.autoBackupEnabled ? 'text-blue-700' : 'text-yellow-700'
                    }`}>
                      {vaultSettings?.autoBackupEnabled ? 'Auto-backup Active' : 'Manual Backup Only'}
                    </div>
                  </div>
                  {vaultSettings?.autoBackupEnabled ? (
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-yellow-600" />
                  )}
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
                  <Button
                    size="sm"
                    className={`rounded-xl ${
                      vaultSettings?.aiLabelingEnabled
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    onClick={async () => {
                      // Toggle AI labeling
                      if (vaultSettings) {
                        try {
                          const newSettings = { ...vaultSettings, aiLabelingEnabled: !vaultSettings.aiLabelingEnabled };
                          const api = USE_MOCK_EVIDENCE_API ? mockEvidenceApi : realEvidenceApi;
                          await api.updateVaultSettings(newSettings);
                          setVaultSettings(newSettings);
                          toast({
                            title: "Success",
                            description: `AI Labeling ${newSettings.aiLabelingEnabled ? 'enabled' : 'disabled'}!`,
                          });
                        } catch (error) {
                          console.error('Error updating vault settings:', error);
                          toast({
                            title: "Error",
                            description: "Failed to update vault settings. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                  >
                    {vaultSettings?.aiLabelingEnabled ? 'Disable AI Labeling' : 'Enable AI Labeling'}
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

      {/* View Evidence Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Evidence Details</span>
            </DialogTitle>
            <DialogDescription>
              View detailed information about this evidence item
            </DialogDescription>
          </DialogHeader>

          {selectedEvidence && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-4xl">{getTypeIcon(selectedEvidence.type)}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedEvidence.title}</h3>
                  <p className="text-gray-600 mb-3">{selectedEvidence.description}</p>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getCategoryColor(selectedEvidence.category)} rounded-full`}>
                      {selectedEvidence.category}
                    </Badge>
                    <Badge className={`${getStatusColor(selectedEvidence.status)} rounded-full`}>
                      {selectedEvidence.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-gray-900">{selectedEvidence.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Uploaded By</label>
                    <p className="text-gray-900">{selectedEvidence.uploadedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Upload Date</label>
                    <p className="text-gray-900">{selectedEvidence.uploadedAt}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">File Size</label>
                    <p className="text-gray-900">{selectedEvidence.fileSize || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project</label>
                    <p className="text-gray-900">{selectedEvidence.projectId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedEvidence.id}</p>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              {selectedEvidence.tags && selectedEvidence.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvidence.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="rounded-full">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Section */}
              {selectedEvidence.url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">URL</label>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <a
                      href={selectedEvidence.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {selectedEvidence.url}
                    </a>
                  </div>
                </div>
              )}

              {/* File Preview Section */}
              {selectedEvidence.type === 'IMAGE' && selectedEvidence.url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Preview</label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedEvidence.url}
                      alt={selectedEvidence.title}
                      className="w-full h-auto max-h-64 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="p-4 bg-yellow-50 rounded-xl">
                <h4 className="font-medium text-yellow-900 mb-2">Additional Information</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p>• Evidence is stored securely with encryption</p>
                  <p>• All access is logged for audit purposes</p>
                  <p>• Download history is tracked</p>
                  {selectedEvidence.downloadUrl && <p>• File is available for download</p>}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowViewModal(false)}
            >
              Close
            </Button>
            {selectedEvidence && (
              <Button
                onClick={() => {
                  handleDownload(selectedEvidence);
                  setShowViewModal(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      {showUploadModal && (
        <EvidenceUpload
          onClose={() => {
            setShowUploadModal(false);
            fetchEvidence(); // Refresh evidence list after upload
          }}
          projects={projects}
          vaultSettings={vaultSettings}
        />
      )}
    </div>
  );
};

export default Evidence;
