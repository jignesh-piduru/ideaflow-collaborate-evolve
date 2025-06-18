import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Clock,
  Save,
  X,
  Search
} from 'lucide-react';

interface IdeaDetailsProps {
  userRole: 'admin' | 'employee';
}

interface Idea {
  id: number;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  tags: string[];
  assignedTo: string;
  upvotes: number;
  comments: number;
  dueDate: string;
  createdDate: string;
}

const IdeaDetails = ({ userRole }: IdeaDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIdea, setEditedIdea] = useState<Idea | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  // Team members array
  const teamMembers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Sarah Smith' },
    { id: 3, name: 'Mike Johnson' },
    { id: 4, name: 'Lisa Chen' }
  ];

  useEffect(() => {
    if (id) {
      fetchIdea(parseInt(id));
    }
  }, [id]);

  // Clear tag search when idea changes or when editing mode changes
  useEffect(() => {
    setTagSearchTerm('');
  }, [idea?.id, isEditing]);

  const fetchIdea = async (ideaId: number) => {
    try {
      setLoading(true);
      // First try to fetch the specific idea
      let response = await fetch(`/api/ideas/${ideaId}`);

      if (response.ok) {
        const data = await response.json();
        setIdea(data);
        setEditedIdea(data);
      } else {
        // Fallback: fetch all ideas and find the specific one
        response = await fetch('/api/ideas');
        if (!response.ok) {
          throw new Error('Failed to fetch ideas');
        }
        const allIdeas = await response.json();
        const foundIdea = allIdeas.find((idea: any) => idea.id === ideaId);

        if (!foundIdea) {
          throw new Error('Idea not found');
        }

        setIdea(foundIdea);
        setEditedIdea(foundIdea);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch idea details. Please try again later.",
        variant: "destructive"
      });
      navigate('/ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedIdea) return;

    try {
      const response = await fetch(`/api/ideas/${editedIdea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedIdea)
      });

      if (!response.ok) {
        throw new Error('Failed to update idea');
      }

      const updatedIdea = await response.json();
      setIdea(updatedIdea);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Idea updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!idea) return;

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete idea');
      }

      toast({
        title: "Success",
        description: "Idea deleted successfully!",
      });
      navigate('/ideas');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpvote = async () => {
    if (!idea) return;

    try {
      const response = await fetch(`/api/ideas/${idea.id}/upvote`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to upvote idea');
      }

      // Refresh the idea data
      await fetchIdea(idea.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote idea. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h2>
        <Button onClick={() => navigate('/ideas')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Ideas
        </Button>
      </div>
    );
  }

  // Filter tags based on search term
  const filteredTags = idea?.tags.filter(tag =>
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/ideas')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ideas
        </Button>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedIdea(idea);
                }}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="space-y-3">
            {isEditing ? (
              <Input
                value={editedIdea?.title || ''}
                onChange={(e) => setEditedIdea(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="text-2xl font-bold"
                placeholder="Idea Title"
              />
            ) : (
              <CardTitle className="text-3xl">{idea.title}</CardTitle>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getPriorityColor(idea.priority)}>
                {idea.priority}
              </Badge>
              <Badge className={getStatusColor(idea.status)}>
                {idea.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            {isEditing ? (
              <Textarea
                value={editedIdea?.description || ''}
                onChange={(e) => setEditedIdea(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={6}
                placeholder="Describe your idea..."
                className="min-h-32"
              />
            ) : (
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {idea.description}
              </p>
            )}
          </div>

          {/* Edit Form Fields */}
          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Priority</h3>
                <Select
                  value={editedIdea?.priority}
                  onValueChange={(value: any) => setEditedIdea(prev => prev ? { ...prev, priority: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Status</h3>
                <Select
                  value={editedIdea?.status}
                  onValueChange={(value: any) => setEditedIdea(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Assigned To</h3>
                <Select
                  value={editedIdea?.assignedTo || ''}
                  onValueChange={(value: string) => setEditedIdea(prev => prev ? { ...prev, assignedTo: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to Team Member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Tags</h3>
                <Input
                  value={editedIdea?.tags.join(', ') || ''}
                  onChange={(e) => setEditedIdea(prev =>
                    prev ? { ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) } : null
                  )}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
          )}

          {/* Tags Display (when not editing) */}
          {!isEditing && idea.tags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Tags</h3>
                  <span className="text-sm text-gray-500">({idea.tags.length})</span>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tags..."
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    className="pl-10 h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  tagSearchTerm && (
                    <p className="text-sm text-gray-500 italic">
                      No tags found matching "{tagSearchTerm}"
                    </p>
                  )
                )}
              </div>
              {tagSearchTerm && filteredTags.length > 0 && (
                <p className="text-xs text-gray-500">
                  Showing {filteredTags.length} of {idea.tags.length} tags
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Assigned to</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {idea.assignedTo ? idea.assignedTo.split(' ').map(n => n[0]).join('') : 'NA'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{idea.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(idea.createdDate).toLocaleDateString()}</p>
                </div>
              </div>

              {idea.dueDate && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{new Date(idea.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleUpvote}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <ThumbsUp className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{idea.upvotes}</span>
                    <span className="text-sm text-gray-500">upvotes</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{idea.comments}</span>
                    <span className="text-sm text-gray-500">comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Idea</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this idea? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 mt-6">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IdeaDetails;
