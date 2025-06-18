import { useState, useEffect } from 'react';
import { mockEvidenceApi, realEvidenceApi, USE_MOCK_EVIDENCE_API } from '@/services/mockEvidenceApi';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  File,
  Image,
  Link,
  X,
  CheckCircle,
  FileText,
  Download,
  Eye
} from 'lucide-react';

interface EvidenceUploadProps {
  onClose: () => void;
  projects?: any[];
  vaultSettings?: any;
}

interface Evidence {
  id: string;
  title: string;
  description?: string;
  type: 'FILE' | 'IMAGE' | 'LINK' | 'TEXT' | 'DOCUMENT';
  fileName?: string;
  fileSize?: string;
  url?: string;
  projectId: string;
  projectName: string;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  tags: string[];
}

const EvidenceUpload = ({ onClose, projects = [], vaultSettings }: EvidenceUploadProps) => {
  const [evidenceType, setEvidenceType] = useState<'FILE' | 'IMAGE' | 'LINK' | 'TEXT'>('FILE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'VALIDATED' | 'REJECTED'>('PENDING');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [existingEvidence] = useState<Evidence[]>([
    {
      id: 1,
      title: 'Database Schema Design',
      description: 'Updated database schema with new tables for user management',
      type: 'file',
      fileName: 'database_schema_v2.pdf',
      fileSize: '2.4 MB',
      projectId: 1,
      projectName: 'AI Customer Support',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-01-20',
      category: 'Database'
    },
    {
      id: 2,
      title: 'API Testing Results',
      description: 'Postman collection results showing successful API endpoints',
      type: 'image',
      fileName: 'api_test_results.png',
      fileSize: '1.8 MB',
      projectId: 1,
      projectName: 'AI Customer Support',
      uploadedBy: 'Sarah Smith',
      uploadedAt: '2024-01-18',
      category: 'API Development'
    },
    {
      id: 3,
      title: 'Live Demo Link',
      description: 'Working prototype of the mobile app performance improvements',
      type: 'link',
      url: 'https://demo.example.com/mobile-app',
      projectId: 2,
      projectName: 'Mobile Optimization',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-16',
      category: 'Go Live'
    }
  ]);

  // Use projects from props or fallback to default
  const projectsList = projects.length > 0 ? projects : [
    { id: '1', name: 'AI Customer Support' },
    { id: '2', name: 'Mobile Optimization' },
    { id: '3', name: 'Blockchain Payments' }
  ];

  const categories = [
    'Database',
    'API Development',
    'Code Deployment',
    'Go Live',
    'Testing',
    'Documentation',
    'UI/UX',
    'Other'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      if (!title) {
        setTitle(files[0].name.split('.')[0]); // Set title to filename without extension
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !selectedProject || !category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (evidenceType === 'LINK' && !url) {
      toast({
        title: "Error",
        description: "Please provide a URL for link evidence.",
        variant: "destructive"
      });
      return;
    }

    if ((evidenceType === 'FILE' || evidenceType === 'IMAGE') && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      const api = USE_MOCK_EVIDENCE_API ? mockEvidenceApi : realEvidenceApi;

      // Parse tags from comma-separated string
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      // Get current user ID (this will be handled automatically by the API service now)
      if (selectedFile) {
        await api.uploadFile(
          selectedFile,
          selectedProject,
          category,
          title,
          description,
          undefined, // currentUserId - will be auto-resolved
          tagsArray,
          status
        );
      } else {
        await api.createEvidence({
          title,
          description,
          type: evidenceType,
          url: evidenceType === 'LINK' ? url : undefined,
          projectId: selectedProject,
          projectName: projectsList.find(p => p.id === selectedProject)?.name || 'Unknown Project',
          category,
          tags: tagsArray,
          status
        });
      }

      toast({
        title: "Success",
        description: "Evidence uploaded successfully!",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedProject('');
      setCategory('');
      setUrl('');
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast({
        title: "Error",
        description: "Failed to upload evidence. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'link': return Link;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Database': return 'bg-blue-100 text-blue-800';
      case 'API Development': return 'bg-green-100 text-green-800';
      case 'Code Deployment': return 'bg-purple-100 text-purple-800';
      case 'Go Live': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evidence Management</DialogTitle>
          <DialogDescription>
            Upload files, images, or links as evidence for your projects
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload New Evidence</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Evidence Type</label>
                <Select value={evidenceType} onValueChange={(value: any) => setEvidenceType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select evidence type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FILE">File Upload</SelectItem>
                    <SelectItem value="IMAGE">Image Upload</SelectItem>
                    <SelectItem value="LINK">External Link</SelectItem>
                    <SelectItem value="TEXT">Text Evidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Evidence Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <Select value={selectedProject} onValueChange={setSelectedProject} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projectsList.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tags (comma-separated)</label>
                <Input
                  placeholder="tag1, tag2, tag3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VALIDATED">Validated</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {evidenceType === 'LINK' ? (
                <Input
                  placeholder="Enter URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              ) : evidenceType === 'TEXT' ? (
                <Textarea
                  placeholder="Enter text evidence content"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your {evidenceType.toLowerCase()} here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept={evidenceType === 'IMAGE' ? 'image/*' : '*'}
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    {evidenceType === 'IMAGE' ? 'PNG, JPG, GIF up to 10MB' : 'Any file up to 50MB'}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Evidence'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {/* Existing Evidence */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Evidence</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {existingEvidence.map((evidence) => {
                const IconComponent = getFileIcon(evidence.type);
                return (
                  <div key={evidence.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{evidence.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{evidence.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {evidence.projectName}
                            </Badge>
                            <Badge className={`text-xs ${getCategoryColor(evidence.category)}`}>
                              {evidence.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{evidence.uploadedBy}</span>
                            <span>{evidence.uploadedAt}</span>
                            {evidence.fileSize && <span>{evidence.fileSize}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceUpload;
